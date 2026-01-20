import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import MarketplaceCard from '../components/marketplace/MarketplaceCard';

const Marketplace = () => {
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const location = useLocation();
    const navigate = useNavigate();

    // Parse query params
    const query = new URLSearchParams(location.search);
    const initialFilters = {
        search: query.get('search') || '',
        category_id: query.get('category_id') || '',
        min_price: query.get('min_price') || '',
        max_price: query.get('max_price') || '',
        listing_type: query.get('listing_type') || '',
        condition_status: query.get('condition_status') || '',
        sort: query.get('sort') || 'created_at_desc',
        page: query.get('page') || 1
    };

    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchListings();
        // Update URL
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        navigate({ search: params.toString() }, { replace: true });
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/marketplace/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/marketplace', { params: filters });
            setListings(res.data.listings);
            setPagination({
                page: res.data.page,
                totalPages: res.data.totalPages,
                total: res.data.total
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
            window.scrollTo(0, 0);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is already handled by state change, this is just to prevent form default
    };

    return (
        <div className="container">
            <h1 className="page-title">Marketplace</h1>

            <div className="marketplace-layout" style={{ display: 'flex', gap: '2rem', flexDirection: 'column-reverse' }}>
                {/* Filters sidebar - Responsive: distinct section on mobile, sidebar on desktop */}
                <div className="filters-sidebar" style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Filters</h3>

                    <form onSubmit={handleSearch}>
                        <div className="form-group">
                            <label>Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search items..."
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="form-control">
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Type</label>
                            <select name="listing_type" value={filters.listing_type} onChange={handleFilterChange} className="form-control">
                                <option value="">All Types</option>
                                <option value="sale">For Sale</option>
                                <option value="exchange">Exchange</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Condition</label>
                            <select name="condition_status" value={filters.condition_status} onChange={handleFilterChange} className="form-control">
                                <option value="">Any Condition</option>
                                <option value="new">New</option>
                                <option value="like_new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Price Range</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    name="min_price"
                                    value={filters.min_price}
                                    onChange={handleFilterChange}
                                    placeholder="Min"
                                    className="form-control"
                                />
                                <input
                                    type="number"
                                    name="max_price"
                                    value={filters.max_price}
                                    onChange={handleFilterChange}
                                    placeholder="Max"
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Sort By</label>
                            <select name="sort" value={filters.sort} onChange={handleFilterChange} className="form-control">
                                <option value="created_at_desc">Newest First</option>
                                <option value="created_at_asc">Oldest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>

                        <button type="button" onClick={() => setFilters(initialFilters)} className="btn btn-outline" style={{ width: '100%' }}>
                            Reset Filters
                        </button>
                    </form>
                </div>

                {/* Listings Grid */}
                <div className="listings-content" style={{ flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : error ? (
                        <div className="alert alert-error">{error}</div>
                    ) : listings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <h3>No items found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {listings.map(listing => (
                                    <MarketplaceCard key={listing.id} listing={listing} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                    >
                                        Previous
                                    </button>

                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`btn ${pagination.page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        className="btn btn-outline"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .marketplace-layout {
                        flex-direction: row !important;
                    }
                    .filters-sidebar {
                        width: 250px;
                        flex-shrink: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Marketplace;
