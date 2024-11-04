import { Request, Response } from "express";
import { query } from "../models/DB";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const login = async (req: Request, res: Response) => {
 
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Email e senha são obrigatórios" });
  }

  const result = await query(`SELECT * FROM users WHERE email = '${email}'`);  

  if(result.rows.length === 0) {
    return res.status(400).send({error: 'Email ou senha inválidos'})
  }  

  const user = result.rows[0] as User

  const isPasswordValid = await bcrypt.compare(password, user.password)
 
  if (!isPasswordValid) {
    return res.status(422).json({ error: "Email ou senha inválidos" })
  }

  const token = jwt.sign({id: user.id, email: user.email, name: user.name}, process.env.JWT_SECRET as string, {
    expiresIn: '1h'
  })

  return res.status(200).json({ token: token});
};

const register = async (req: Request, res: Response) => {

  const { name, email, password, password_confirmation } = req.body
  
  if(!email || !password || !password_confirmation) {
    return res.status(400).json({error: "Campos são obrigatórios"})
  }  

  const result = await query(`SELECT * FROM users WHERE email = '${email}'`);  
    
  if(result.rows.length > 0) {
    return res.status(400).json({error: "O email informado já está sendo utilizado"})
  }

  if(password !== password_confirmation) {
    return res.status(400).json({ error: "password e password_confirmation devem coincidir"})
  }  

  const hashedPassword = await bcrypt.hash(password, 10)

  await query(`INSERT INTO users (name, email, password) VALUES ('${name}','${email}', '${hashedPassword}')`)
    .catch((error) => {
        console.log(error)
        return res.status(500).json({error: error})
    })  

  return res.status(201).send({message: 'Usuário criado com sucesso'})
};

const users = async (req: Request, res: Response) => {
  const result = await query(`SELECT * FROM users`);

  return res.send(result.rows)
};

const message = async (req: Request, res: Response) => {
  const { to, sender, content } = req.body;

  await query(`INSERT INTO messages (from_user_id, to_user_id, message) VALUES ($1, $2, $3)`, [sender.id, to.id, content]);

  return res.status(201).send({ message: 'Mensagem enviada com sucesso' });
};

const getMessages = async (req: Request, res: Response) => {
  const result = await query(`
    SELECT u."name" as username, m.* FROM messages m
    inner join users u on
      m.from_user_id = u.id
  `);

  return res.send(result.rows)
};


export { login, register, users, message, getMessages };
