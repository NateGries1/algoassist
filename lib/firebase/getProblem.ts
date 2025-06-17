import firebase_app from '@/lib/firebase/firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Get the Firestore instance
const db = getFirestore(firebase_app);

// Function to retrieve a document from a Firestore collection
export default async function getProblem(problemName: string) {
    // Variable to store the result of the operation
    let result = null;
    // Variable to store any error that occurs during the operation
    let error = null;

    try {
        const problemsRef = collection(db, 'problems');
        const q = query(problemsRef, where('function', '==', problemName));
        // Retrieve the document using the document reference
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const document = snapshot.docs[0];
            result = { id: document.id, ...document.data() };
        }
    } catch (e) {
        error = e;
    }

    return { result, error };
}
