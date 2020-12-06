import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
//your firebase configuration app

})

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>GoChat💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatWindow /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="signin" onClick={signInWithGoogle}>Sign in with Google account to access GoChat💬!</button>

    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="signout" onClick={() => auth.signOut()}>Sign Out here!</button>
  )
}


function ChatWindow() {
  const referenca = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);


  const [messages] = useCollectionData(query, { idField: 'id' });
  const [valueForm, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;

    await messagesRef.add({
      text: valueForm,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,

    })

    setFormValue('');
    referenca.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={referenca}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={valueForm} onChange={(e) => setFormValue(e.target.value)} placeholder="Write your message ..." />

      <button type="submit" disabled={!valueForm}>send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  </>)
}


export default App;