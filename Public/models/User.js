import { nanoid } from 'nanoid';
import { db } from '../../config/firebase.js';
const usersCollection = db.collection('Users');
class User {
  constructor(data) {
    this._id = data._id || nanoid(6);
    this.userName = data.userName;
    this.email = data.email;
    this.password = data.password;
  }
  async save() {
    const userData = {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      password: this.password,
      createdAt: new Date()
    };
    await usersCollection.doc(this._id).set(userData);
    return this;
  }
  static async find() {
    const snapshot = await usersCollection.get();
    const users = [];
    snapshot.forEach(doc => {
      users.push(doc.data());
    });
    return users;
  }
  static async findOne(query) {
    const { userName, email, password } = query;
    let queryRef = usersCollection;
    if (userName) {
      queryRef = queryRef.where('userName', '==', userName);
    }
    if (email) {
      queryRef = queryRef.where('email', '==', email);
    }
    if (password) {
      queryRef = queryRef.where('password', '==', password);
    }
    const snapshot = await queryRef.limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data();
  }
  static async findById(id) {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  }
  static async findByIdAndDelete(id) {
    await usersCollection.doc(id).delete();
    return { _id: id };
  }
  static async findByIdAndUpdate(id, updateData, options = {}) {
    const docRef = usersCollection.doc(id);
    await docRef.update(updateData);
    if (options.new) {
      const doc = await docRef.get();
      return doc.data();
    }
    return { _id: id, ...updateData };
  }
}
export default User;