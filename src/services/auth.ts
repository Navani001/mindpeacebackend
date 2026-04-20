import fastify from "../middleware/jwt";
import prisma from "../lib/prisma";
import { roles } from "@prisma/client";
export async function Login(data:any) {
      if (!data) {
            console.log("No data provided");
            return { message: "no data provided", data: null };
        }
    try{
          const user =await prisma.user.findFirst({where: {email:data.email}})      
          if(user==null){
            return {message:"Login falied",data:null}
          }
          const accessToken = fastify.jwt.sign({ payload:{id:user?.id,name:user?.name,email:user?.email,role:user?.role} });
         return {message:"Login successful",data:{user:user,token:accessToken}}
    }
    catch(err){
        return {message:"Login successful",data:null}
    }
   
}

export async function CreateUser(data:any) {
      if (!data) {
            console.log("No data provided");
            return { message: "no data provided", data: null };
        }
    try{          
                const requestedRole = data.role ?? roles.student;
                const allowedRoles = [roles.student, roles.consultant];
                if (!allowedRoles.includes(requestedRole)) {
                    return { message: "invalid role", data: null };
                }

        const user =await prisma.user.create({data:{
            name:data.name,
            email:data.email,
            password:data.password,
                        phoneNumber:data.phoneNumber,
                        role: requestedRole,
        }})
        
                    const accessToken = fastify.jwt.sign({ payload:{id:user?.id,name:user?.name,email:user?.email,role:user?.role} });
          if(user==null){
            return {message:"account creation falied",data:null}
          }
          
         return {message:"account creation successful",data:{user:user,token:accessToken}}
    }
    catch(err){
        return {message:"account creation failed",data:null}
    }
   
}



