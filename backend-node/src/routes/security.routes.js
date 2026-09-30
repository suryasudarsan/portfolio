const express = require('express');
const router = express.Router();
const certifications = require('../data/certifications.json');
const skills = require('../data/skills.json');

// Mock Public PGP Armor Key block for the Cybersecurity Engineer
const PGP_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v5.11.0
Comment: Cybersecurity Engineer Portfolio Public Key

xsFNBGY72h8BEADJ7c+Z+Xw9oQ6t2pU7o6YfK3pM4qR8lP2vK1nL9jX0aB5c
dE8fG1hI2jK3lM4nO5pQ6rS7tU8vW9xY0z1aB2cD3eF4gH5iJ6kL7mN8oP9q
R0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7aB8cD9e
F0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9s
T0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6aB7cD8eF9g
H0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9u
V0wX1yZ2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9i
=Sec0
-----END PGP PUBLIC KEY BLOCK-----`;

/**
 * Route: GET /api/certifications
 * Description: Returns list of verified cybersecurity certifications
 */
router.get('/certifications', (req, res) => {
  res.status(200).json({
    success: true,
    count: certifications.length,
    data: certifications
  });
});

/**
 * Route: GET /api/skills
 * Description: Returns categorized skills and technical proficiencies
 */
router.get('/skills', (req, res) => {
  res.status(200).json({
    success: true,
    data: skills.domains
  });
});

/**
 * Route: GET /api/pgp-key
 * Description: Returns public GPG/PGP key for secure encrypted communication
 */
router.get('/pgp-key', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(PGP_PUBLIC_KEY);
});

/**
 * Route: GET /api/stats
 * Description: High-level engineering metrics & defensive stats
 */
router.get('/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      threatsNeutralized: 1420,
      vulnerabilitiesRemediated: 384,
      systemsHardened: 120,
      uptimeReliability: "99.99%",
      securityClearance: "Public Trust / Eligible",
      primaryFocus: "Cloud Infrastructure Defense & AppSec"
    }
  });
});

module.exports = router;
