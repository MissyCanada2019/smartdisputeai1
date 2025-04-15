import React from 'react';

interface PayPalBuyNowButtonProps {
  paymentId: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonText?: string;
}

export default function PayPalBuyNowButton({
  paymentId,
  buttonColor = '#FFD140',
  buttonTextColor = '#000000',
  buttonText = 'Buy Now'
}: PayPalBuyNowButtonProps) {
  return (
    <>
      <style>
        {`.pp-${paymentId}{
          text-align:center;
          border:none;
          border-radius:0.25rem;
          min-width:11.625rem;
          padding:0 2rem;
          height:2.625rem;
          font-weight:bold;
          background-color:${buttonColor};
          color:${buttonTextColor};
          font-family:"Helvetica Neue",Arial,sans-serif;
          font-size:1rem;
          line-height:1.25rem;
          cursor:pointer;
        }`}
      </style>
      <form 
        action={`https://www.paypal.com/ncp/payment/${paymentId}`} 
        method="post" 
        target="_blank" 
        style={{display: 'inline-grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem'}}
      >
        <input className={`pp-${paymentId}`} type="submit" value={buttonText} />
        <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" />
        <section> 
          Powered by <img 
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
            alt="paypal" 
            style={{height: '0.875rem', verticalAlign: 'middle'}}
          />
        </section>
      </form>
    </>
  );
}