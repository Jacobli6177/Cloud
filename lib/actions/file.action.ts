'use server';

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";


const handleError = (error: unknown, message:string) => {
    console.log(error, message);
    throw error
}

const createQueries = (currentUser: Models.Document) => {
    const queries = [
        Query.or([
            Query.equal('owners',[currentUser.$id]),
            Query.contains('user',[currentUser.email])
        ]),
    ];
    return queries
}

export const uploadFile = async ({file, ownerId, accountId, path}: UploadFileProps) => {
    const { storage, databases } = await createAdminClient();


    try {
        const inputFile = InputFile.fromBuffer(file, file.name)
        const bucketFile = await storage.createFile(
            appwriteConfig.bucketId, 
            ID.unique(),
            inputFile,);
    
        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            user: [],
            bucketFile: bucketFile.$id
        };

        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument,
        )
        .catch(async (error: unknown) => {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
            handleError(error, "Failed to create file document")
        });

        revalidatePath(path);
        return parseStringify(newFile);
    } catch(error) {
        handleError(error, "Failed to upload message")
    }
}



export const getFiles = async () => {
    const { databases } = await createAdminClient();

    try {
        const CurrentUser = await getCurrentUser();

        if(!CurrentUser) throw new Error("user not found");

        const queries = createQueries(CurrentUser);

        const file = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            queries,
        );
        return parseStringify(file)

    } catch (error) {
        handleError(error, "Failed to get File")
    }
}

const renameFile = async({ fileId, name, extension, path}: RenameFileProps) => {
    const { databases} = await createAdminClient();

    try {
        const newName = `${name}.${extension}`;
        const updatedFile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        {
            name: newName,
        },
    );
    } catch (error) {
        handleError(error, "Failed to rename file")
    }
}