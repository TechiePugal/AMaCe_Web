import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase"

export class FirebaseService {
  // Generic CRUD operations
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error("Error adding document: ", error)
      return { success: false, error }
    }
  }

  static async getAll(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return { success: true, data }
    } catch (error) {
      console.error("Error getting documents: ", error)
      return { success: false, error }
    }
  }

  static async update(collectionName: string, id: string, data: any) {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date(),
      })
      return { success: true }
    } catch (error) {
      console.error("Error updating document: ", error)
      return { success: false, error }
    }
  }

  static async delete(collectionName: string, id: string) {
    try {
      await deleteDoc(doc(db, collectionName, id))
      return { success: true }
    } catch (error) {
      console.error("Error deleting document: ", error)
      return { success: false, error }
    }
  }

  static async getByStatus(collectionName: string, status: string) {
    try {
      const q = query(collection(db, collectionName), where("status", "==", status), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return { success: true, data }
    } catch (error) {
      console.error("Error getting documents by status: ", error)
      return { success: false, error }
    }
  }

  static async getByField(collectionName: string, field: string, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, "==", value), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return { success: true, data }
    } catch (error) {
      console.error(`Error getting documents by ${field}:`, error)
      return { success: false, error }
    }
  }

  static async getByMultipleFields(collectionName: string, filters: { field: string; value: any }[]) {
    try {
      let q = query(collection(db, collectionName))

      filters.forEach((filter) => {
        q = query(q, where(filter.field, "==", filter.value))
      })

      q = query(q, orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return { success: true, data }
    } catch (error) {
      console.error("Error getting documents by multiple fields:", error)
      return { success: false, error }
    }
  }
}
