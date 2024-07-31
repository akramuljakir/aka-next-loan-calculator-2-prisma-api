'use client';

import { useState, useEffect } from 'react';
import Amortization from '@/components/Amortization';

const Page = ({ params }) => {
    const [loans, setLoans] = useState([]);
    const [loan, setLoan] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(null);
    const [monthsLeft, setMonthsLeft] = useState(null);
    const [totalEmiPaid, setTotalEmiPaid] = useState(0);
    const [currentMonth, setCurrentMonth] = useState('');

    useEffect(() => {
        async function getLoans() {
            try {
                const response = await fetch("/api/loans");
                const data = await response.json();
                setLoans(data.data);
            } catch (error) {
                console.error("Failed to fetch loans", error);
            }
        }
        getLoans();
    }, []);

    useEffect(() => {
        if (params.id && loans.length > 0) {
            const selectedLoan = loans.find(loan => loan.id === parseInt(params.id));
            setLoan(selectedLoan || null);
        }
    }, [params.id, loans]);

    useEffect(() => {
        if (loan) {
            calculateCurrentBalance();
            calculateMonthsLeft();
            calculateTotalEmiPaid();
            setCurrentMonth(new Date().toLocaleString('default', { month: 'long' }));
        }
    }, [loan]);

    const handleChange = (event) => {
        const selectedLoanId = parseInt(event.target.value);
        const selectedLoan = loans.find(loan => loan.id === selectedLoanId);
        setLoan(selectedLoan);
    };

    const calculateCurrentBalance = () => {
        if (!loan) return;
        const monthlyInterestRate = parseFloat(loan.annualInterestRate) / 12 / 100;
        const emiAmount = parseFloat(loan.emiAmount);
        const loanStartDate = new Date(loan.loanStartDate);
        const currentDate = new Date();
        const monthsElapsed = Math.floor((currentDate - loanStartDate) / (1000 * 60 * 60 * 24 * 30));

        let remainingBalance = parseFloat(loan.loanAmount);
        for (let i = 0; i < monthsElapsed; i++) {
            const interest = remainingBalance * monthlyInterestRate;
            const principal = emiAmount - interest;
            remainingBalance -= principal;
        }

        setCurrentBalance(remainingBalance.toFixed(2));
    };

    const calculateMonthsLeft = () => {
        if (!loan) return;
        const monthlyInterestRate = parseFloat(loan.annualInterestRate) / 12 / 100;
        const emiAmount = parseFloat(loan.emiAmount);
        let remainingBalance = parseFloat(loan.loanAmount);
        let monthsLeft = 0;

        while (remainingBalance > emiAmount) {
            const interest = remainingBalance * monthlyInterestRate;
            const principal = emiAmount - interest;
            remainingBalance -= principal;
            monthsLeft++;
        }

        if (remainingBalance > 0) {
            monthsLeft++;
        }

        setMonthsLeft(monthsLeft);
    };

    const calculateTotalEmiPaid = () => {
        if (!loan) return;
        const monthlyInterestRate = parseFloat(loan.annualInterestRate) / 12 / 100;
        const emiAmount = parseFloat(loan.emiAmount);
        const loanStartDate = new Date(loan.loanStartDate);
        const currentDate = new Date();
        const monthsElapsed = Math.floor((currentDate - loanStartDate) / (1000 * 60 * 60 * 24 * 30));

        let totalPaid = emiAmount * monthsElapsed;
        setTotalEmiPaid(totalPaid.toFixed(2));
    };

    if (!loan) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{loan.loanName}</h1>
            <div className="mb-4">
                <label htmlFor="loanSelect" className="mr-2">Change Loan:</label>
                <select id="loanSelect" onChange={handleChange} className="p-2 border rounded">
                    {loans.map((loan) => (
                        <option key={loan.id} value={loan.id}>{loan.loanName}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md border">
                <p><strong>Loan ID:</strong> {loan.id}</p>
                <p><strong>Loan Amount:</strong> {loan.loanAmount}</p>
                <p><strong>Interest Rate:</strong> {loan.annualInterestRate}%</p>
                <p><strong>EMI Amount:</strong> {loan.emiAmount}</p>
                <p><strong>Total EMI Paid:</strong> {totalEmiPaid}</p>
                <p><strong>Current Month:</strong> {currentMonth}</p>
                <p><strong>Current Balance:</strong> {currentBalance || 'Calculating...'}</p>
                <p><strong>Months Left:</strong> {monthsLeft !== null ? monthsLeft : 'Calculating...'}</p>
            </div>
            <div className="mt-4">
                <Amortization loan={loan} currentMonth={currentMonth} />
            </div>
        </div>
    );
};

export default Page;
