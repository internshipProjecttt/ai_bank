import { request } from 'https';
import {NextResponse, NextRequest} from 'next/server';

export async function GET(request: NextRequest){
    try{
        const accountId= request.nextUrl.searchParams.get('accountId');

        if (!accountId) {
            return NextResponse.json(
                { error: 'accountId is required' },
                { status: 400 }
            );
        }
        const response= await fetch(`http://localhost:5000/api/Transaction/account/${accountId}/stats`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if(!response.ok){
            throw new Error("Failed to fecth data summary");
        }
        const data= await response.json();
        return NextResponse.json(data);

    }catch(e){
        console.error("Dashboard summary route error: ",e);
        return NextResponse.json(
            {error: 'Summary information could not be retrieved.'},
            {status: 500}
        );
    }
}