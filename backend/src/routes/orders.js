const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST create order
router.post('/', async (req, res) => {
  try {
    const {
      customer_name, customer_email, customer_phone,
      shipping_address, city, state, pincode,
      items, subtotal, shipping_charge, total_amount,
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      notes
    } = req.body;

    // Generate order number
    const { data: orderNumData } = await supabase.rpc('generate_order_number');
    const order_number = orderNumData || `BHM-${Date.now()}`;

    // Upsert customer
    let customerId = null;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer_email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({ name: customer_name, email: customer_email, phone: customer_phone, city, state, pincode })
        .select('id')
        .single();
      if (newCustomer) customerId = newCustomer.id;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        customer_id: customerId,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        state,
        pincode,
        subtotal,
        shipping_charge: shipping_charge || 0,
        total_amount,
        payment_status: razorpay_payment_id ? 'paid' : 'pending',
        order_status: 'placed',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        notes
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET order by order_number
router.get('/:orderNumber', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', req.params.orderNumber)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
