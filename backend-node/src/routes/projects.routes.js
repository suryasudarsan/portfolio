const express = require('express');
const router = express.Router();
const projects = require('../data/projects.json');

/**
 * Route: GET /api/projects
 * Description: Returns dynamic data detailing cybersecurity projects, write-ups, and security tools.
 * Query Parameters:
 *   - tag: Filter by tag (e.g. ?tag=Docker)
 *   - category: Filter by category (e.g. ?category=Cloud)
 */
router.get('/', (req, res) => {
  const { tag, category } = req.query;
  let filteredProjects = [...projects];

  if (tag && typeof tag === 'string') {
    const cleanTag = tag.trim().toLowerCase();
    filteredProjects = filteredProjects.filter(p =>
      p.tags.some(t => t.toLowerCase() === cleanTag)
    );
  }

  if (category && typeof category === 'string') {
    const cleanCategory = category.trim().toLowerCase();
    filteredProjects = filteredProjects.filter(p =>
      p.category.toLowerCase().includes(cleanCategory)
    );
  }

  res.status(200).json({
    success: true,
    count: filteredProjects.length,
    data: filteredProjects
  });
});

/**
 * Route: GET /api/projects/:id
 * Description: Retrieve specific project write-up by ID
 */
router.get('/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  if (isNaN(projectId)) {
    return res.status(400).json({
      success: false,
      error: 'Project ID must be an integer.'
    });
  }

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      error: `Project with ID ${projectId} not found.`
    });
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

module.exports = router;
