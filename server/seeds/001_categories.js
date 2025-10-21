exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();

  // Inserts seed entries
  await knex('categories').insert([
    {
      id: 1,
      name: 'Rings',
      slug: 'rings',
      description: 'Beautiful rings for every occasion and budget',
      icon: '💍',
      sort_order: 1,
      is_active: true
    },
    {
      id: 2,
      name: 'Necklaces',
      slug: 'necklaces',
      description: 'Elegant necklaces to complete any look',
      icon: '💎',
      sort_order: 2,
      is_active: true
    },
    {
      id: 3,
      name: 'Earrings',
      slug: 'earrings',
      description: 'Stylish earrings for everyday wear',
      icon: '💫',
      sort_order: 3,
      is_active: true
    },
    {
      id: 4,
      name: 'Bracelets',
      slug: 'bracelets',
      description: 'Stunning bracelets and bangles',
      icon: '💍',
      sort_order: 4,
      is_active: true
    },
    {
      id: 5,
      name: 'Mens Jewelry',
      slug: 'mens-jewelry',
      description: 'Sophisticated jewelry for men',
      icon: '🕊️',
      sort_order: 5,
      is_active: true
    },
    {
      id: 6,
      name: 'Body Jewelry',
      slug: 'body-jewelry',
      description: 'Trendy body jewelry and accessories',
      icon: '💠',
      sort_order: 6,
      is_active: true
    }
  ]);
};
