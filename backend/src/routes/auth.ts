import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/pool'
import { sendResetCodeEmail } from '../lib/mailer'

const router = Router()

// Puxa o segredo do .env de forma estrita. Se não existir, interrompe na inicialização.
const JWT_SECRET: string = process.env.JWT_SECRET as string

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não está definida nas variáveis de ambiente.')
  }
  return JWT_SECRET
}

// 1. Registro
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Preencha todos os campos corretamente' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()

    if (!cleanEmail || !cleanName || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos' })
    }

    const exists = await db('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail])
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email já cadastrado' })
    }

    const hash = await bcrypt.hash(password, 10)
    const { rows } = await db(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email, xp, level',
      [cleanName, cleanEmail, hash]
    )
    const user = rows[0]

    await db(
      'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1,$2,$3,$4)',
      [user.id, 'WELCOME', 50, 'Bem-vindo ao OREFORGE! Primeira forja iniciada ⛏️']
    )
    await db('UPDATE users SET xp = 50 WHERE id = $1', [user.id])

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '30d' })
    return res.status(201).json({ token, user: { ...user, xp: 50 } })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// 2. Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const { rows } = await db(
      'SELECT id, name, email, password, xp, level FROM users WHERE LOWER(email) = LOWER($1)',
      [cleanEmail]
    )
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas' })

    const user = rows[0]
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' })

    const { password: _, ...safeUser } = user
    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '30d' })

    return res.json({ token, user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// 3. Enviar código de recuperação
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (typeof email !== 'string') return res.status(400).json({ error: 'Informe o e-mail' })

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return res.status(400).json({ error: 'Informe o e-mail' })

    const { rows } = await db('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail])

    if (!rows.length) {
      return res.json({ message: 'Se o e-mail estiver cadastrado, o código foi gerado.' })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await db('DELETE FROM password_resets WHERE email = $1', [cleanEmail])
    await db(
      'INSERT INTO password_resets (email, code, expires_at) VALUES ($1, $2, $3)',
      [cleanEmail, code, expiresAt]
    )

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendResetCodeEmail(cleanEmail, code)
      } catch (mailError) {
        console.error('Erro ao enviar e-mail via SMTP:', mailError)
      }
    }

    return res.json({
      message: 'Código de verificação gerado com sucesso.',
      code: process.env.NODE_ENV !== 'production' ? code : undefined,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// 4. Verificar código de recuperação
router.post('/verify-reset-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body
    if (typeof email !== 'string' || typeof code !== 'string') {
      return res.status(400).json({ error: 'E-mail e código são obrigatórios' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    const { rows } = await db(
      'SELECT id, expires_at FROM password_resets WHERE email = $1 AND code = $2',
      [cleanEmail, cleanCode]
    )

    if (!rows.length) {
      return res.status(400).json({ error: 'Código inválido ou incorreto' })
    }

    if (new Date() > new Date(rows[0].expires_at)) {
      return res.status(400).json({ error: 'Código expirado. Solicite um novo.' })
    }

    return res.json({ valid: true })
  } catch (error) {
    console.error('Verify code error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// 5. Redefinir senha
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body
    if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Preencha todos os campos' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    const { rows } = await db(
      'SELECT id, expires_at FROM password_resets WHERE email = $1 AND code = $2',
      [cleanEmail, cleanCode]
    )

    if (!rows.length || new Date() > new Date(rows[0].expires_at)) {
      return res.status(400).json({ error: 'Código inválido ou expirado' })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await db('UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2)', [hash, cleanEmail])
    await db('DELETE FROM password_resets WHERE email = $1', [cleanEmail])

    return res.json({ message: 'Senha redefinida com sucesso!' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// 6. Excluir conta permanentemente
router.delete('/delete-account', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' })

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string }

    await db('DELETE FROM password_resets WHERE email IN (SELECT email FROM users WHERE id = $1)', [decoded.userId])
    await db('DELETE FROM xp_events WHERE user_id = $1', [decoded.userId])
    await db('DELETE FROM investments WHERE user_id = $1', [decoded.userId])
    await db('DELETE FROM users WHERE id = $1', [decoded.userId])

    return res.json({ message: 'Conta excluída com sucesso.' })
  } catch (error) {
    console.error('Delete account error:', error)
    return res.status(500).json({ error: 'Erro ao excluir conta' })
  }
})

export default router