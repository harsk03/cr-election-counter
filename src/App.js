// App.js
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import ReactConfetti from 'react-confetti';
import { FaTrophy, FaUserCircle, FaTrash, FaEdit } from 'react-icons/fa';
import './styles.css';

const App = () => {
  const [step, setStep] = useState('setup');
  const [nominees, setNominees] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [editingNominee, setEditingNominee] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 }
  });

  const handleAddNominee = (event) => {
    event.preventDefault();
    const form = event.target;
    const newNominee = {
      id: editingNominee ? editingNominee.id : nominees.length + 1,
      name: form.name.value,
      prn: form.prn.value,
      phone: form.phone.value,
      photo: selectedFile || '/api/placeholder/150/150',
      votes: editingNominee ? editingNominee.votes : 0,
      percentage: 0
    };

    if (editingNominee) {
      setNominees(nominees.map(nom => 
        nom.id === editingNominee.id ? newNominee : nom
      ));
      setEditingNominee(null);
    } else {
      setNominees([...nominees, newNominee]);
    }

    form.reset();
    setSelectedFile(null);
  };

  const handleVote = (nomineeId) => {
    const newTotal = totalVotes + 1;
    setTotalVotes(newTotal);
    
    setNominees(nominees.map(nominee => {
      if (nominee.id === nomineeId) {
        const newVotes = nominee.votes + 1;
        return {
          ...nominee,
          votes: newVotes,
          percentage: (newVotes / newTotal) * 100
        };
      }
      return {
        ...nominee,
        percentage: (nominee.votes / newTotal) * 100
      };
    }));
  };

  const handleDeleteNominee = (id) => {
    setNominees(nominees.filter(nom => nom.id !== id));
  };

  const handleEditNominee = (nominee) => {
    setEditingNominee(nominee);
    setSelectedFile(nominee.photo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getWinner = () => {
    return nominees.reduce((prev, current) => 
      (prev.votes > current.votes) ? prev : current
    );
  };

  const declareWinner = () => {
    setShowWinner(true);
  };

  return (
    <div className="app">
      {showWinner && (
        <>
          <ReactConfetti
            width={windowDimensions.width}
            height={windowDimensions.height}
          />
          <div className="winner-announcement">
            <FaTrophy className="trophy-icon" />
            <h2>Winner!</h2>
            <div className="winner-card">
              <img src={getWinner().photo} alt={getWinner().name} />
              <h3>{getWinner().name}</h3>
              <p>Total Votes: {getWinner().votes}</p>
              <p>Percentage: {getWinner().percentage.toFixed(1)}%</p>
            </div>
            <button onClick={() => setShowWinner(false)}>Close</button>
          </div>
        </>
      )}

      <animated.h1 style={fadeIn} className="title">
        CR Election Vote Counter
      </animated.h1>
      
      {step === 'setup' && (
        <animated.div style={fadeIn} className="setup-container">
          <h2>{editingNominee ? 'Edit Nominee' : 'Add New Nominee'}</h2>
          <form onSubmit={handleAddNominee} className="nominee-form">
            <input 
              type="text" 
              name="name" 
              placeholder="Nominee Name" 
              required 
              defaultValue={editingNominee?.name}
            />
            <input 
              type="text" 
              name="prn" 
              placeholder="PRN Number" 
              required 
              defaultValue={editingNominee?.prn}
            />
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone Number" 
              required 
              defaultValue={editingNominee?.phone}
            />
            <div className="file-input-container">
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
              />
              {selectedFile && (
                <img 
                  src={selectedFile} 
                  alt="Preview" 
                  className="photo-preview" 
                />
              )}
            </div>
            <button type="submit">
              {editingNominee ? 'Update Nominee' : 'Add Nominee'}
            </button>
          </form>
          
          {nominees.length > 0 && (
            <div className="nominees-list">
              <h3>Added Nominees</h3>
              {nominees.map(nominee => (
                <div key={nominee.id} className="nominee-list-item">
                  <img 
                    src={nominee.photo} 
                    alt={nominee.name} 
                    className="nominee-list-photo" 
                  />
                  <span>{nominee.name}</span>
                  <div className="nominee-actions">
                    <button 
                      onClick={() => handleEditNominee(nominee)}
                      className="edit-btn"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDeleteNominee(nominee.id)}
                      className="delete-btn"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                className="start-voting" 
                onClick={() => setStep('voting')}
              >
                Start Voting
              </button>
            </div>
          )}
        </animated.div>
      )}

      {step === 'voting' && (
        <animated.div style={fadeIn} className="voting-container">
          <div className="voting-header">
            <h2>Total Votes: {totalVotes}</h2>
            <div className="voting-actions">
              <button onClick={() => setStep('setup')} className="home-btn">
                Home
              </button>
              <button onClick={declareWinner} className="declare-winner-btn">
                Declare Winner
              </button>
            </div>
          </div>
          <div className="nominees-grid">
            {nominees.map(nominee => (
              <div 
                key={nominee.id} 
                className="nominee-card"
                onClick={() => handleVote(nominee.id)}
              >
                <div className="nominee-photo-container">
                  {nominee.photo ? (
                    <img 
                      src={nominee.photo} 
                      alt={nominee.name} 
                      className="nominee-photo" 
                    />
                  ) : (
                    <FaUserCircle className="nominee-photo-placeholder" />
                  )}
                </div>
                <h3>{nominee.name}</h3>
                <div className="vote-count">
                  <span className="votes">{nominee.votes}</span>
                  <div 
                    className="vote-bar" 
                    style={{
                      width: `${nominee.percentage}%`
                    }}
                  ></div>
                </div>
                <div className="percentage">{nominee.percentage.toFixed(1)}%</div>
                <div className="nominee-details">
                  <p>PRN: {nominee.prn}</p>
                  <p>Phone: {nominee.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </animated.div>
      )}
    </div>
  );
};

export default App;