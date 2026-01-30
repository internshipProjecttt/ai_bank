import {request} from 'https';
import {NextResponse, NextRequest} from 'next/server';

export async function GET(request: NextRequest){
    try{
        const userId= request.nextUrl.searchParams.get('userId');
        if(!userId){
            return NextResponse.json(
                {error: "userId is required"},
                {status: 400}
            );
        } 
        const response = await fetch('http://localhost:5000/apiNotification/notfication/{userId}',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if(!response.ok){
            throw new Error("Failed to fetch notifications");
        }
        const data= await response.json;
        return NextResponse.json(data);
    }catch(e){
        console.error("Dashboard notification route error: ", e);
        return NextResponse.json(
            {error: "Notifications could not be retrieved"},
            {status: 500}
        );
    }
}
