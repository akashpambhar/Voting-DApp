import styles from '../styles/Home.module.css'
import { useState } from 'react';
import { Contract } from "ethers";
import { useRouter } from 'next/router';
import { VOTING_CONTRACT_ADDRESS, abi } from "../constants";

export default function Voter(props) {

  const { getProviderOrSigner } = props;
  const router = useRouter();

  const [toggleForm, setToggleForm] = useState('login');
  const [loading, setLoading] = useState(false);

  const [voterRegistrationValues, setVoterRegistrationValues] = useState(
    {
      "id": 0,
      "name": "",
      "age": 0,
      "stateCode": "",
      "constituencyCode": "",
      "password": "",
      "voted": false,
      "votedTo": 0
    }
  );
  const [voterLoginValues, setVoterLoginValues] = useState(
    {
      "id": 0,
      "password": ""
    }
  );

  function handleRegisterValueChange(e) {
    setVoterRegistrationValues({
      ...voterRegistrationValues,
      [e.target.name]: e.target.value
    });
  }

  function handleLoginValueChange(e) {
    setVoterLoginValues({
      ...voterLoginValues,
      [e.target.name]: e.target.value
    });
  }

  const voterRegistration = async (event) => {
    event.preventDefault();
    try {
      const signer = await getProviderOrSigner(true);

      const votingContract = new Contract(
        VOTING_CONTRACT_ADDRESS,
        abi,
        signer
      );

      setLoading(true);

      const tx = await votingContract.registerVoter(voterRegistrationValues);

      await tx.wait(1);

      setLoading(false);

      router.push('/voter');

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const voterLogin = async (event) => {
    event.preventDefault();
    localStorage.clear();

    try {
      const signer = await getProviderOrSigner(true);

      const votingContract = new Contract(
        VOTING_CONTRACT_ADDRESS,
        abi,
        signer
      );

      setLoading(true);

      const tx = await votingContract.loginVoter(voterLoginValues.id, voterLoginValues.password);

      setLoading(false);

      localStorage.setItem('voterID', BigInt(tx._voter.id));
      localStorage.setItem('voted', Boolean(tx._voter.voted));


      if (tx.login) router.push('/voterDashboard');

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const render = () => {
    if (loading) {
      return <label> Loading..... </label>
    }
  }

  const switchCandidate = () => {
    router.push('/candidate');
  }

  return (
    <div className="styles.main">
      <div className={styles.container}>
        <div className={styles.devideTwo} style={{
          display: (toggleForm == "login") ? "none" : "flex",
        }}>
          <h1 className={styles.h1}>Voter Registration </h1>
          <form className={styles.form} onSubmit={voterRegistration}>
            <input className={styles.input} id="name" name="name" placeholder='Name' type="text" onChange={handleRegisterValueChange} />
            <input className={styles.input} id="age" name="age" placeholder='Age' type="text" onChange={handleRegisterValueChange} />
            <input className={styles.input} id="id" name="id" placeholder='Phone No' type="text" onChange={handleRegisterValueChange} />
            <input className={styles.input} id="stateCode" name="stateCode" placeholder='State Code' type="text" onChange={handleRegisterValueChange} />
            <input className={styles.input} id="constituencyCode" name="constituencyCode" placeholder='Constituency Code' type="text" onChange={handleRegisterValueChange} />
            <input className={styles.input} id="password" name="password" placeholder='Password' type="password" onChange={handleRegisterValueChange} />
            <button className={styles.button} type='submit'> Register </button>
            <button className={`${styles.button} ${styles.buttonBordered}`} onClick={(e) => { e.preventDefault(); setToggleForm('login'); }}> Login </button>
          </form>

        </div>

        <div className={styles.devideTwo} style={{
          display: (toggleForm == "register") ? "none" : "flex",
        }}>
          <h1 className={styles.h1}>Voter Login </h1>
          <form className={styles.form} onSubmit={voterLogin}>
            <input className={styles.input} id="id" name="id" placeholder='ID' type="text" onChange={handleLoginValueChange} />
            <input className={styles.input} id="password" name="password" placeholder='Password' type="password" onChange={handleLoginValueChange} />
            <button className={styles.button} type='submit'> Login </button>
            <button className={`${styles.button} ${styles.buttonBordered}`} onClick={(e) => { e.preventDefault(); setToggleForm('register'); }}> Register </button>
            <button onClick={switchCandidate}> Go to Candidate </button>
          </form>
        </div>
        {render()}<br />
      </div>
    </div>
  )
}