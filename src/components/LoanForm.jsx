import { useState, useEffect } from 'react';

const LoanForm = ({ loan, onSave, onClose }) => {
    // Initialize state with loan data or default values
    const [loanForm, setLoanForm] = useState({
        loanName: '',
        loanAmount: '',
        annualInterestRate: '',
        emiAmount: '',
        loanStartDate: '',
    });

    // Function to format date into YYYY-MM-DD
    const formatDate = (date) => {
        return date ? new Date(date).toISOString().split('T')[0] : '';
    };

    // Update form state when loan prop changes
    useEffect(() => {
        if (loan) {
            setLoanForm({
                loanName: loan.loanName || '',
                loanAmount: loan.loanAmount || '',
                annualInterestRate: loan.annualInterestRate || '',
                emiAmount: loan.emiAmount || '',
                loanStartDate: formatDate(loan.loanStartDate) || '',
            });
        } else {
            setLoanForm({
                loanName: '',
                loanAmount: '',
                annualInterestRate: '',
                emiAmount: '',
                loanStartDate: '',
            });
        }
    }, [loan]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoanForm({ ...loanForm, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(loanForm);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-4xl">
                <h2 className="text-2xl mb-4">{loan ? 'Edit Loan' : 'Add Loan'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block">Loan Name:</label>
                        <input
                            type="text"
                            name="loanName"
                            value={loanForm.loanName}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Loan Amount:</label>
                        <input
                            type="number"
                            name="loanAmount"
                            value={loanForm.loanAmount}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Annual Interest Rate:</label>
                        <input
                            type="number"
                            name="annualInterestRate"
                            value={loanForm.annualInterestRate}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block">EMI Amount:</label>
                        <input
                            type="number"
                            name="emiAmount"
                            value={loanForm.emiAmount}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Loan Start Date:</label>
                        <input
                            type="date"
                            name="loanStartDate"
                            value={loanForm.loanStartDate}
                            onChange={handleInputChange}
                            className="border p-2 w-full"
                        />
                    </div>

                    <div className="col-span-2 flex space-x-4 justify-end">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                            {loan ? 'Update Loan' : 'Add Loan'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanForm;
