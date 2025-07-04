import firebase_app from '@/lib/firebase/firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Get the Firestore instance
const db = getFirestore(firebase_app);

// Function to retrieve a document from a Firestore collection
export default async function getProblem(field: string, value: string) {
    // Variable to store the result of the operation
    let result = null;
    // Variable to store any error that occurs during the operation
    let error = null;

    try {
        const problemsRef = collection(db, 'problem');
        let q;
        if (field && value !== undefined) {
            q = query(problemsRef, where(field, '==', value));
        } else {
            q = problemsRef;
        }
        // Retrieve the document using the document reference
        const snapshot = await getDocs(q);
        result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        error = e;
    }

    return { result, error };
}
