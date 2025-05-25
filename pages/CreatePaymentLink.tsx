import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { createPaymentLink } from '../services/api';
import { PaymentLinkRequest } from '../types/payment';

const CreatePaymentLink: React.FC = () => {
  const [formData, setFormData] = useState<PaymentLinkRequest>({
    amount: 0,
    token: '',
    orderId: '',
    wallet: ''
  });
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      const response = await createPaymentLink(formData);
      setPaymentUrl(response.paymentUrl);
      setShowSuccess(true);
      setError('');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el enlace de pago');
      setShowSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Crear Enlace de Pago
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Monto"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            
            <TextField
              fullWidth
              label="Token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="Ej: USDC, ETH, etc."
            />
            
            <TextField
              fullWidth
              label="ID de Orden"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="Ej: ORD-123"
            />
            
            <TextField
              fullWidth
              label="Wallet"
              name="wallet"
              value={formData.wallet}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="0x..."
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Generar Enlace
            </Button>
          </form>

          {paymentUrl && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Enlace de Pago Generado:</Typography>
              <Typography 
                component="a" 
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'block',
                  wordBreak: 'break-all',
                  color: 'primary.main'
                }}
              >
                {paymentUrl}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar 
        open={showSuccess} 
        autoHideDuration={6000} 
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">
          Enlace de pago generado exitosamente
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreatePaymentLink; 