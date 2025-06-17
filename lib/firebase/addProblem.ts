import firebase_app from '@/lib/firebase/firebase';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import getProblem from '@/lib/firebase/getProblem';
import { Problem } from '@/types/problem';

// Get the Firestore instance
const db = getFirestore(firebase_app);

// Function to retrieve a document from a Firestore collection
export default async function addProblem(payload: Problem) {
    // Variable to store the result of the operation
    let result = null;
    // Variable to store any error that occurs during the operation
    let error = null;

    try {
        const {
            result: document,
            error: getError
        } = await getProblem(payload.function);
        if (getError) {
            return {
                result: null,
                error: `Error checking for existing problem: ${getError}`
            };
        }
        if (document) {
            return {
                result: null,
                error: `Problem with function name ${payload.function} already exists.`
            };
        }
        // Set the document with the provided data in the specified collection and ID
        console.log('Adding problem:', payload);
        //const newDocRef = doc(collection(db, 'problems'));
        //result = await setDoc(newDocRef, payload, { merge: true });
    } catch (e) {
        // Catch and store any error that occurs during the operation
        error = e;
    }

    return { result, error };
}
