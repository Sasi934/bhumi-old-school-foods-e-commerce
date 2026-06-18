const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all products (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, tags } = req.query;

    let query = supabase
      .from('products')
      .select('*, categories(name, name_telugu, slug)')
      .eq('is_available', true)
      .order('is_featured', { ascending: false })
      .order('name');

    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, name_telugu, slug)')
      .eq('slug', req.params.slug)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
