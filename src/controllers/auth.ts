import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUser, Login } from "../services/auth";
export async function LoginUserController(req: FastifyRequest, reply: FastifyReply) {
  const { email } = req.body as { email: string };

  try {
    const result = await Login({ email });
    if (result.data) {
      return reply.status(200).send({
        success: true,
        message: 'Login successful',
        data: result.data
      });
    } else {
      return reply.status(401).send({
        success: false,
        message: 'Login failed',
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
export async function CreateUserController(req: FastifyRequest, reply: FastifyReply) {
  const { email,password,phoneNumber,name } = req.body as { email: string,password: string, phoneNumber: string, name: string };

  try {
    // Call the Login function
    const result = await CreateUser({ email,password,phoneNumber ,name });

    // If login was successful
    if (result.data) {
      
      // Send success response
      return reply.status(201).send({
        success: true,
        message: 'Account creation successful',
        data: result.data
      });
    } else {
      // If there was an error during login
      return reply.status(400).send({
        success: false,
        message: 'Account creation failed',
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    // Handle any unexpected errors
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}