"use server";

import { createAdminClient } from "@/appwrite";
import { appwriteConfig } from "@/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";


const getUserbyEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    );
    return result.total > 0 ? result.documents[0]: null
} 
const handleError = (error: unknown, message:string) => {
    console.log(error, message);
    throw error
}

export const sendEmailOTP = async ({email}: {email: string}) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch(error) {
        handleError(error, "Failed to send email OTP")
    };
}

export const createAccount = async ({
    fullName,
    email,
}: {
    fullName: string;
    email: string;
}) => {
    const existingUser = await getUserbyEmail(email);

    const accountID = await sendEmailOTP({ email })

    if(!accountID) throw new Error("Failed to send an OTP");

    if(!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "dsdsds",
                accountID,
            }
        )
    }
    return parseStringify( {accountID})
};

export const verifySecret = async ({accountId, password}: {accountId: string; password: string}) => {
    
    try {
        const { account } = await createAdminClient();

        const session = await account.createSession(accountId, password);

        (await cookies()).set('appwrite-session', session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        });
        return parseStringify({sessionId: session.$id})
    } catch (error) {
        handleError(error, "Failed to verify OTP")
    }
    
}