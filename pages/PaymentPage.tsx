import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { getPaymentDetails } from '../services/api';
import { PaymentDetails } from '../types/payment';

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (!orderId) {
          throw new Error('No se proporcionó un ID de orden');
        }
        const details = await getPaymentDetails(orderId);
        setPaymentDetails(details);
        setError('');
      } catch (err) {
        setError('Error al cargar los detalles del pago');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  const handlePayment = async () => {
    try {
      // Aquí iría la lógica para procesar el pago
      // Por ahora solo simulamos un pago exitoso
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Error al procesar el pago');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Detalles del Pago
          </Typography>

          {paymentDetails && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">ID de Orden:</Typography>
                <Typography>{paymentDetails.orderId}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Monto:</Typography>
                <Typography>{paymentDetails.amount} {paymentDetails.token}</Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handlePayment}
                sx={{ mt: 2 }}
              >
                Realizar Pago
              </Button>
            </>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">
          Pago procesado exitosamente
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentPage; 