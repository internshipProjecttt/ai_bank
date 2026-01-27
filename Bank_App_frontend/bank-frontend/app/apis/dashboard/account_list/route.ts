import {NextResponse} from 'next/server';

export async function GET(){
    try{
        const userID= 'user-id';

        const response= await fetch(`http://localhost:5000/api/UserAccount/${userID}/`,
            {
                method: 'GET',
                headers:{
                    'Authorization':'Bearer ${token}',
                },
            }
        );
        const account= await response.json();

    }catch(e){
        console.error("Account list route error: ",e);
        return NextResponse.json(
            {error: 'Account list could not be retrieved'},
            {status: 500}
        );
    }
}