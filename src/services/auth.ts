import fastify from "../middleware/jwt";
import prisma from "../lib/prisma";
export async function Login(data:any) {
      if (!data) {
            console.log("No data provided");
            return { message: "no data provided", data: null };
        }
    try{
          const user =await prisma.user.findFirst({where: {email:data.email}})      
          const accessToken = fastify.jwt.sign({ payload:{id:user?.id,name:user?.name,email:user?.email} });
          if(user==null){
            return {message:"Login falied",data:null}
          }
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
        const user =await prisma.user.create({data:{
            name:data.name,
            email:data.email,
            password:data.password,
            phoneNumber:data.phoneNumber
        }})
        
          const accessToken = fastify.jwt.sign({ payload:{id:user?.id,name:user?.name,email:user?.email} });
          if(user==null){
            return {message:"account creation falied",data:null}
          }
          
         return {message:"account creation successful",data:{user:user,token:accessToken}}
    }
    catch(err){
        return {message:"account creation failed",data:null}
    }
   
}



