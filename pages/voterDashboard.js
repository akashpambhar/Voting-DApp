import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Contract } from "ethers";
import { VOTING_CONTRACT_ADDRESS, abi } from "../constants";

export default function VoterDashboard(props) {
    const { getProviderOrSigner } = props;
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [load, setLoad] = useState(false);
    const [thanks, setThanks] = useState(false);

    const [candidateList, setCandidateList] = useState([]);

    const [votes, setVotes] = useState([]);

    const getCandidateList = async (id) => {
        try {
            const signer = await getProviderOrSigner(true);

            const votingContract = new Contract(
                VOTING_CONTRACT_ADDRESS,
                abi,
                signer
            );

            setLoading(true);

            const tx = await votingContract.getCandidateList(id);

            setLoading(false);

            setCandidateList(tx);

            setLoad(true);

        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const voteCandidate = async (id) => {
        try {
            const signer = await getProviderOrSigner(true);

            const votingContract = new Contract(
                VOTING_CONTRACT_ADDRESS,
                abi,
                signer
            );

            setLoading(true);

            const tx = await votingContract.vote(BigInt(id), parseInt(localStorage.getItem('voterID')), new Date().getTime());

            await tx.wait(1);

            setLoading(false);

            setLoad(false);

            localStorage.setItem('voted', 'true');

            setThanks(true);

        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const getVoteCounts = async () => {
        try {
            const signer = await getProviderOrSigner(true);

            const votingContract = new Contract(
                VOTING_CONTRACT_ADDRESS,
                abi,
                signer
            );

            setLoading(true);

            const tx = await votingContract.getVoteCounts();

            setLoading(false);

            setVotes(tx);

        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const logOut = async () => {
        localStorage.clear();
        router.push('/voter');
    }

    useEffect(() => {
        if (!localStorage.getItem('voterID')) {
            router.push('/voter')
            return;
        }

        if (localStorage.getItem('voted') === 'true') {
            getVoteCounts();
            setThanks(true);
        } else {
            getCandidateList(localStorage.getItem('voterID'))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const render = () => {
        if (loading) {
            return <label> Loading..... </label>
        }
    }

    const print = () => {
        if (load) {
            return (
                <div>
                    <table className="table table-striped table-hover">
                        <tbody>
                            {candidateList.map(candidateList => {
                                return (
                                    <tr key={candidateList.nominationNo}>
                                        <td> {candidateList.name} </td>
                                        <td> {(candidateList.voteCount).toString()} </td>
                                        <td><button className={styles.button} onClick={() => voteCandidate(candidateList.nominationNo)} > Vote </button></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )
        }
    }

    const thankyou = () => {
        if (thanks) {
            return (
                <>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Party</th>
                                <th>Vote Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {votes.map(votes => {
                                return (
                                    <tr key={votes.name}>
                                        <td>{votes.name}</td>
                                        <td>{votes.party}</td>
                                        <td>{(votes.votes).toString()}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <h3 className='text-center'>You have already voted. Thank you! </h3>
                </>
            );
        }
    }

    return (
        <div className='container'>
            <h1 className='text-center mt-3'>Election Result</h1>
            {print()}
            {thankyou()}
            {render()}
            <button onClick={logOut} className="btn btn-primary mt-5">Log Out</button>
        </div>
    );
}