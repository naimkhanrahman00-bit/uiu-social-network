import { useState, useEffect } from 'react';
import axios from '../api/axios';
import MarketplaceCard from '../components/MarketplaceCard';

const MarketplaceFeed = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    // Filters & Pagination
    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        min_price: '',
        max_price: '',
        listing_type: '',
        condition_status: '',
        sort: 'date_desc',
        page: 1
    });

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/marketplace/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });

                const res = await axios.get(`/marketplace?${queryParams.toString()}`);
                setListings(res.data.listings);
                setPagination({
                    total: res.data.total,
                    totalPages: res.data.totalPages
                });
            } catch (err) {
                console.error('Error fetching listings:', err);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchListings();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to page 1 on filter change
        }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const styles = {
        container: {
            display: 'flex',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem 1rem',
            gap: '2rem',
            flexDirection: 'row',
            alignItems: 'flex-start'
        },
        sidebar: {
            width: '250px',
            flexShrink: 0,
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '20px'
        },
        main: {
            flex: 1,
            width: '0' // Fix flex overflow issue
        },
        sectionTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            marginTop: '1.5rem',
            color: '#374151'
        },
        firstSectionTitle: {
            marginTop: 0
        },
        input: {
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
        },
        select: {
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginBottom: '0.5rem',
            backgroundColor: 'white'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '3rem'
        },
        pageBtn: {
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            cursor: 'pointer'
        },
        activePageBtn: {
            backgroundColor: '#2563eb',
            color: 'white',
            borderColor: '#2563eb'
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar Filters */}
            <aside style={styles.sidebar}>
                <h3 style={{ ...styles.sectionTitle, ...styles.firstSectionTitle }}>Filter</h3>

                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                <select
                    name="category_id"
                    value={filters.category_id}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <h3 style={styles.sectionTitle}>Price Range</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="number"
                        name="min_price"
                        placeholder="Min"
                        value={filters.min_price}
                        onChange={handleFilterChange}
                        style={styles.input}
                    />
                    <input
                        type="number"
                        name="max_price"
                        placeholder="Max"
                        value={filters.max_price}
                        onChange={handleFilterChange}
                        style={styles.input}
                    />
                </div>

                <h3 style={styles.sectionTitle}>Listing Type</h3>
                <select
                    name="listing_type"
                    value={filters.listing_type}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="">Any Type</option>
                    <option value="sale">For Sale</option>
                    <option value="exchange">Exchange</option>
                    <option value="both">Both</option>
                </select>

                <h3 style={styles.sectionTitle}>Condition</h3>
                <select
                    name="condition_status"
                    value={filters.condition_status}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="">Any Condition</option>
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                </select>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <div style={styles.header}>
                    <input
                        type="text"
                        name="search"
                        placeholder="Search listings..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        style={{ ...styles.input, width: '300px', marginBottom: 0 }}
                    />

                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        style={{ ...styles.select, width: '200px', marginBottom: 0 }}
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                {loading ? (
                    <div>Loading...</div>
                ) : listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        No listings found matching your criteria.
                    </div>
                ) : (
                    <>
                        <div style={styles.grid}>
                            {listings.map(listing => (
                                <MarketplaceCard key={listing.id} listing={listing} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                    style={{ ...styles.pageBtn, opacity: filters.page === 1 ? 0.5 : 1 }}
                                >
                                    Previous
                                </button>

                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        style={{
                                            ...styles.pageBtn,
                                            ...(filters.page === i + 1 ? styles.activePageBtn : {})
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === pagination.totalPages}
                                    style={{ ...styles.pageBtn, opacity: filters.page === pagination.totalPages ? 0.5 : 1 }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default MarketplaceFeed;
