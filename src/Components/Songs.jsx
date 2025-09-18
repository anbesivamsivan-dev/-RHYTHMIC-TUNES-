import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import './sidebar.css';

function Songs() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const audioRefs = useRef({});

  // Fetch data only once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, favRes, playlistRes] = await Promise.all([
          axios.get('http://localhost:3000/items'),
          axios.get('http://localhost:3000/favorities'),
          axios.get('http://localhost:3000/playlist')
        ]);
        setItems(itemsRes.data);
        setWishlist(favRes.data);
        setPlaylist(playlistRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleAudioPlay = (id) => {
    if (currentlyPlaying && currentlyPlaying !== audioRefs.current[id]) {
      currentlyPlaying.pause();
    }
    setCurrentlyPlaying(audioRefs.current[id]);
  };

  // Wishlist functions
  const addToWishlist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) return;
      const { title, imgUrl, genre, songUrl, singer, id } = selectedItem;
      await axios.post('http://localhost:3000/favorities', {
        itemId: id,
        title,
        imgUrl,
        genre,
        songUrl,
        singer,
      });
      const res = await axios.get('http://localhost:3000/favorities');
      setWishlist(res.data);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const selectedItem = wishlist.find((item) => item.itemId === itemId);
      if (!selectedItem) return;
      await axios.delete(`http://localhost:3000/favorities/${selectedItem.id}`);
      const res = await axios.get('http://localhost:3000/favorities');
      setWishlist(res.data);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const isItemInWishlist = (itemId) =>
    wishlist.some((item) => item.itemId === itemId);

  // Playlist functions
  const addToPlaylist = async (itemId) => {
    try {
      const selectedItem = items.find((item) => item.id === itemId);
      if (!selectedItem) return;
      const { title, imgUrl, genre, songUrl, singer, id } = selectedItem;
      await axios.post('http://localhost:3000/playlist', {
        itemId: id,
        title,
        imgUrl,
        genre,
        songUrl,
        singer,
      });
      const res = await axios.get('http://localhost:3000/playlist');
      setPlaylist(res.data);
    } catch (err) {
      console.error('Error adding to playlist:', err);
    }
  };

  const removeFromPlaylist = async (itemId) => {
    try {
      const selectedItem = playlist.find((item) => item.itemId === itemId);
      if (!selectedItem) return;
      await axios.delete(`http://localhost:3000/playlist/${selectedItem.id}`);
      const res = await axios.get('http://localhost:3000/playlist');
      setPlaylist(res.data);
    } catch (err) {
      console.error('Error removing from playlist:', err);
    }
  };

  const isItemInPlaylist = (itemId) =>
    playlist.some((item) => item.itemId === itemId);

  // Search filter
  const filteredItems = items.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.singer.toLowerCase().includes(query) ||
      item.genre.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div className="songs-container" style={{ width: '1300px' }}>
        <div className="container mx-auto p-3">
          <h2 className="text-3xl font-semibold mb-4 text-center">Songs List</h2>

          <InputGroup className="mb-3">
            <InputGroup.Text id="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search by singer, genre, or song name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </InputGroup>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="col">
                <div className="card h-100">
                  <img
                    src={item.imgUrl}
                    alt={item.title}
                    className="card-img-top rounded-top"
                    style={{ height: '200px', width: '100%' }}
                  />
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title">{item.title}</h5>
                      {isItemInWishlist(item.id) ? (
                        <Button
                          variant="light"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <FaHeart color="red" />
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          onClick={() => addToWishlist(item.id)}
                        >
                          <FaRegHeart color="black" />
                        </Button>
                      )}
                    </div>
                    <p className="card-text">Genre: {item.genre}</p>
                    <p className="card-text">Singer: {item.singer}</p>
                    <audio
                      controls
                      className="w-100"
                      ref={(el) => (audioRefs.current[item.id] = el)}
                      onPlay={() => handleAudioPlay(item.id)}
                    >
                      <source src={item.songUrl} />
                    </audio>
                  </div>
                  <div className="card-footer d-flex justify-content-center">
                    {isItemInPlaylist(item.id) ? (
                      <Button
                        variant="outline-secondary"
                        onClick={() => removeFromPlaylist(item.id)}
                      >
                        Remove From Playlist
                      </Button>
                    ) : (
                      <Button
                        variant="outline-primary"
                        onClick={() => addToPlaylist(item.id)}
                      >
                        Add to Playlist
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Songs;
