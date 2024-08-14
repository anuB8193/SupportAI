'use client'
import { Box, Button, Stack, TextField } from '@mui/material'
import Image from "next/image"  // Keeping this import as requested
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello and welcome! I’m here to support you on your mental wellness journey. Whether you're looking for tips on managing stress, coping with anxiety, or just need someone to talk to, I'm here to help. How can I assist you today?`
  }]);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    const currentMessage = message; // Store the current message

    setMessage(''); // Clear the input field

    // Add the user message and a placeholder for the assistant response
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: currentMessage },
      { role: "assistant", content: "..." } // Placeholder to indicate the bot is typing
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: currentMessage }]), // Correctly pass the message content
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });

        // Update the assistant's message as it arrives, replacing the placeholder
        setMessages((prevMessages) => {
          const lastMessageIndex = prevMessages.length - 1;
          const otherMessages = prevMessages.slice(0, lastMessageIndex); // Correctly slice the messages array
          return [
            ...otherMessages,
            {
              ...prevMessages[lastMessageIndex],
              content: prevMessages[lastMessageIndex].content.replace("...", "") + text // Replace "..." with the actual text content
            },
          ];
        });
        return reader.read().then(processText);
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, prevMessages.length - 1), // Remove the placeholder
        { role: "assistant", content: "Sorry, there was an error processing your request." }
      ]);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box   
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(to bottom, #556B5F, #8AA08C)',  // Darker green gradient ombre background
        backgroundSize: 'cover', // Ensure the background covers the entire area
        overflow: 'hidden' // Prevent scrollbars on the container
      }}
    >
      <Stack
        direction="column"
        width="700px"   
        height="800px"  
        border="2px solid #3E5245"  // Darker sage green border
        borderRadius={16}  
        p={2}
        spacing={3}
        bgcolor="#A1B5A0"  // Darker chat box background
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"  
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          borderRadius={16}
          bgcolor="#A1B5A0"  // Matching background color for consistency
          p={2}
          sx={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#556B5F',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#A1B5A0',
            }
          }}
        >
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={
              message.role === 'assistant' ? 'flex-start' : 'flex-end'
            }              
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                  ? '#738F7A'  // Darker sage green for assistant message
                  : '#8FA98C'  // Darker green for user message
                }
                color='black'
                borderRadius={20}  
                p={4}  
                maxWidth="80%"  
                wordWrap="break-word" 
                display="flex"
                alignItems="center"
                justifyContent="center"  
                fontSize="1rem"  
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack 
          direction="row" 
          spacing={2} 
          mt={2} 
        >
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              flexGrow: 1,
              backgroundColor: '#8FA98C',  // Darker green for input background
              borderRadius: '50px',  
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',  
              }
            }}  
          />
          <Button 
            variant="contained"
            onClick={sendMessage}
            style={{
              backgroundColor: '#556B5F',  
              color: 'white',
              borderRadius: '50px',  
              padding: '10px 20px',  
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>     
  )
}
