//src/app/combined/page.jsx

'use client';

import { useState, useEffect } from 'react';

// Utility function to sort ledger entries by date
const sortByDate = (entries) => {
    return entries.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const calculateAmortization = (loan) => {
    const amortizationSchedule = [];
    const monthlyInterestRate = parseFloat(loan.annualInterestRate) / 12 / 100;
    let remainingBalance = parseFloat(loan.loanAmount);
    const emiAmount = parseFloat(loan.emiAmount);
    const startDate = new Date(loan.loanStartDate);
    let currentDate = new Date(startDate);

    while (remainingBalance > 0) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = emiAmount - interest;
        remainingBalance -= principal;
        if (remainingBalance < 0) remainingBalance = 0;

        amortizationSchedule.push({
            date: currentDate.toISOString().split('T')[0],
            amount: principal.toFixed(2),
            interest: interest.toFixed(2),
            emiToPay: emiAmount.toFixed(2),
            balance: remainingBalance.toFixed(2),
            loanName: loan.loanName
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return amortizationSchedule;
};

const CombinedAmortizationPage = () => {
    const [loans, setLoans] = useState([]);
    const [amortizationSchedule, setAmortizationSchedule] = useState([]);
    let totalLoans = 0;
    let data = [];
    let openingDate = '';

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await fetch('/api/loans'); // Adjust the endpoint as needed
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setLoans(result.data);

                // Combine amortization schedules of all loans
                const allSchedules = result.data.reduce((acc, loan) => {
                    return acc.concat(calculateAmortization(loan));
                }, []);

                // Sort by date
                allSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));

                setAmortizationSchedule(allSchedules);
            } catch (error) {
                console.error('Failed to fetch loans:', error);
            }
        };

        fetchLoans();
    }, []);

    const getMonthClass = (date) => {
        const month = new Date(date).getMonth();
        const colors = [
            'bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100',
            'bg-teal-100', 'bg-blue-100', 'bg-indigo-100', 'bg-purple-100',
            'bg-pink-100', 'bg-gray-100', 'bg-red-200', 'bg-orange-200'
        ];
        return colors[month % colors.length];
    };

    // Calculate opening balance and data array
    loans.forEach(loan => {
        const creditAmount = parseFloat(loan.loanAmount);
        const principalpaid = 0 - creditAmount;
        data.push({
            date: loan.loanStartDate.split('T')[0],
            description: `New Loan: ${loan.loanName} Start`,
            principalpaid: principalpaid,
            emiToPay: 0,
            interest: 0,
            balance: creditAmount,
            totalLoans: totalLoans + creditAmount
        });

        totalLoans += creditAmount;
    });

    amortizationSchedule.forEach(transaction => {
        const debitAmount = parseFloat(transaction.emiToPay);
        const creditAmount = parseFloat(transaction.interest);
        const balance = parseFloat(transaction.balance);

        totalLoans -= debitAmount;
        totalLoans += creditAmount;
        const principalpaid = debitAmount - creditAmount;
        data.push({
            date: transaction.date,
            description: `${transaction.loanName} EMI`,
            principalpaid: principalpaid,
            emiToPay: debitAmount,
            interest: creditAmount,
            balance: balance,
            totalLoans: totalLoans
        });
    });

    // Find the oldest date in the data array
    if (data.length > 0) {
        openingDate = sortByDate(data)[0].date;
    }

    // Add opening balance entry
    const opening = [
        { date: openingDate, description: 'Opening Balance', principalpaid: 0, interest: 0, emiToPay: 0, balance: 0, totalLoans: 0 }
    ];

    // Add opening balance to the beginning of the data array
    data = [...opening, ...data];

    const sortedData = sortByDate(data);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">All Loans Amortization Schedule</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b">Sl No</th>
                            <th className="px-4 py-2 border-b">Date</th>
                            <th className="px-4 py-2 border-b">Loan Name</th>
                            <th className="px-4 py-2 border-b">Principal Paid</th>
                            <th className="px-4 py-2 border-b">Interest</th>
                            <th className="px-4 py-2 border-b">EMI to Pay</th>
                            <th className="px-4 py-2 border-b">Loan Balance</th>
                            <th className="px-4 py-2 border-b">Total Loans</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((payment, index) => (
                            <tr key={index} className={getMonthClass(payment.date)}>
                                <td className="px-4 py-2 border-b">{index + 1}</td>
                                <td className="px-4 py-2 border-b">{payment.date}</td>
                                <td className="px-4 py-2 border-b">{payment.description}</td>
                                <td className="px-4 py-2 border-b">{payment.principalpaid.toFixed(2)}</td>
                                <td className="px-4 py-2 border-b">{payment.interest.toFixed(2)}</td>
                                <td className="px-4 py-2 border-b">{payment.emiToPay.toFixed(2)}</td>
                                <td className="px-4 py-2 border-b">{payment.balance.toFixed(2)}</td>
                                <td className="px-4 py-2 border-b">{payment.totalLoans.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CombinedAmortizationPage;
