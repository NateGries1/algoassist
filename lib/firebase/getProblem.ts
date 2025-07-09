import firebase_app from '@/lib/firebase/firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const db = getFirestore(firebase_app);

// Function to retrieve a document from a 'problem' collection
export default async function getProblem(field: string, value: string) {
    let result = null;
    let error = null;

    try {
        const problemsRef = collection(db, 'unverified');
        let q;
        if (field && value) {
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
