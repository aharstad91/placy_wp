/**
 * Mapbox Draw Admin Interface for Route Story Custom Geometry
 * Integrates Mapbox GL + Draw plugin into WordPress ACF fields
 */

(function($) {
  'use strict';

  // Configuration
  const MAPBOX_TOKEN = window.placyMapboxConfig?.token || '';
  const DEFAULT_CENTER = [13.0, 65.0]; // Norway overview
  const DEFAULT_ZOOM = 5;

  let map = null;
  let draw = null;
  let modal = null;
  let currentFeature = null;

  /**
   * Initialize when DOM is ready
   */
  $(document).ready(function() {
    // Only run on route_story edit screens
    if (!$('body').hasClass('post-type-route_story')) {
      return;
    }

    initDrawInterface();
    
    // ACF fields may load after document ready, so add button with delay
    setTimeout(function() {
      addExportButton();
    }, 500);
    
    // Try again after a longer delay if ACF is slow
    setTimeout(function() {
      if ($('#export-earth-studio').length === 0) {
        console.log('Retrying addExportButton...');
        addExportButton();
      }
    }, 2000);
  });

  /**
   * Get ACF field for route geometry JSON
   */
  function getRouteGeometryField() {
    // Try multiple selectors to find the ACF textarea
    let $field = $('textarea[data-name="route_geometry_json"]');
    
    if ($field.length === 0) {
      $field = $('textarea[name*="route_geometry_json"]');
    }
    
    if ($field.length === 0) {
      $field = $('#acf-field_route_geometry_json');
    }
    
    if ($field.length === 0) {
      console.error('Could not find route_geometry_json field. Available textareas:', $('textarea').map(function() { return $(this).attr('name') || $(this).attr('data-name'); }).get());
    }
    
    return $field;
  }

  /**
   * Make field readonly (visual only)
   */
  function makeFieldReadonly() {
    const $field = getRouteGeometryField();
    if ($field && $field.length > 0) {
      $field.attr('readonly', 'readonly');
      $field.css({
        'background-color': '#f0f0f1',
        'cursor': 'not-allowed',
        'color': '#666'
      });
    }
  }

  /**
   * Make field editable (for saving)
   */
  function makeFieldEditable() {
    const $field = getRouteGeometryField();
    if ($field && $field.length > 0) {
      $field.removeAttr('readonly');
      $field.css({
        'background-color': '#fff',
        'cursor': 'text',
        'color': '#000'
      });
    }
  }

  /**
   * Initialize Draw Interface
   */
  function initDrawInterface() {
    // Create modal structure
    createModal();

    // Bind button events
    $('#open-mapbox-draw').on('click', openDrawModal);
    $('#edit-mapbox-draw').on('click', openDrawModal);
    $('#clear-mapbox-draw').on('click', clearRoute);
    $('#mapbox-draw-close').on('click', closeDrawModal);
    $('#mapbox-draw-save').on('click', saveRoute);
    $('#mapbox-draw-cancel').on('click', closeDrawModal);

    // Make the GeoJSON field visually readonly (but not via ACF so it saves)
    makeFieldReadonly();

    // Check if route already exists
    checkExistingRoute();

    // Listen for successful autosave to reapply readonly
    $(document).on('heartbeat-tick.autosave', function() {
      setTimeout(makeFieldReadonly, 1000);
    });
  }

  /**
   * Create Modal HTML
   */
  function createModal() {
    const modalHTML = `
      <div id="mapbox-draw-modal" class="placy-mapbox-modal" style="display: none;">
        <div class="placy-modal-overlay"></div>
        <div class="placy-modal-content">
          <div class="placy-modal-header">
            <h2>Draw Custom Route</h2>
            <button type="button" id="mapbox-draw-close" class="placy-modal-close">
              <span class="dashicons dashicons-no-alt"></span>
            </button>
          </div>
          <div class="placy-modal-body">
            <div id="mapbox-draw-map" style="width: 100%; height: 100%;"></div>
            <div class="placy-draw-instructions">
              <p><strong>How to draw:</strong></p>
              <ol>
                <li>Click on the map to add points along your route</li>
                <li>Continue clicking to extend the route</li>
                <li>Double-click on the last point to finish</li>
                <li>Drag points to adjust the route</li>
                <li>Click "Save Route" when done</li>
              </ol>
            </div>
          </div>
          <div class="placy-modal-footer">
            <button type="button" id="mapbox-draw-cancel" class="button button-large">Cancel</button>
            <button type="button" id="mapbox-draw-save" class="button button-primary button-large">Save Route</button>
          </div>
        </div>
      </div>
    `;
    
    $('body').append(modalHTML);
    modal = $('#mapbox-draw-modal');
  }
  
  /**
   * Add Export Earth Studio Button - SIMPLIFIED VERSION
   */
  function addExportButton() {
    console.log('=== addExportButton START ===');
    
    // AGGRESSIVE cleanup - remove ALL export buttons first
    console.log('Removing existing buttons...');
    $('button').each(function() {
      const buttonText = $(this).text();
      if (buttonText.includes('Export for Google') || buttonText.includes('Earth Studio')) {
        console.log('Removing button:', buttonText);
        $(this).closest('div').remove(); // Remove wrapper too
        $(this).remove();
      }
    });
    
    // Wait a moment for cleanup
    setTimeout(function() {
      console.log('Creating new export button...');
      
      // Find the Route Waypoints field - try different approaches
      let $targetField = null;
      
      // Try 1: Direct data-name
      $targetField = $('.acf-field[data-name="route_waypoints"]');
      console.log('Try 1 - data-name selector found:', $targetField.length);
      
      if ($targetField.length === 0) {
        // Try 2: Look for field with "Route Waypoints" label
        $targetField = $('.acf-field .acf-label:contains("Route Waypoints")').closest('.acf-field');
        console.log('Try 2 - label contains found:', $targetField.length);
      }
      
      if ($targetField.length > 0) {
        // Use the FIRST match only
        $targetField = $targetField.first();
        console.log('Using field:', $targetField.attr('data-name'), $targetField.attr('data-key'));
        
        // Create button HTML
        const buttonHTML = `
          <div id="earth-studio-export-wrapper" style="margin: 15px 0; padding: 12px; background: #f0f0f1; border-radius: 4px;">
            <button type="button" id="export-earth-studio" class="button button-secondary" style="display: inline-flex; align-items: center; gap: 8px;">
              <span class="dashicons dashicons-download"></span>
              <span>Export for Google Earth Studio</span>
            </button>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
              Export all waypoint coordinates to JSON for Google Earth Studio flyover generation.
            </p>
          </div>
        `;
        
        // Insert button after the label
        $targetField.find('.acf-label').first().after(buttonHTML);
        
        // Bind click event
        $('#export-earth-studio').off('click').on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('===EXPORT BUTTON CLICKED===');
          exportForEarthStudio();
          return false;
        });
        
        console.log('✅ Export button added successfully!');
      } else {
        console.error('❌ Could not find Route Waypoints field');
      }
      
      console.log('=== addExportButton END ===');
    }, 100);
  }

  /**
   * Open Draw Modal
   */
  function openDrawModal() {
    if (!MAPBOX_TOKEN) {
      alert('Mapbox token is not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to environment.');
      return;
    }

    modal.fadeIn(200);
    $('body').addClass('placy-modal-open');

    // Initialize map if not already done
    if (!map) {
      initializeMap();
    } else {
      map.resize();
    }

    // Load existing route if available
    loadExistingRoute();
  }

  /**
   * Close Draw Modal
   */
  function closeDrawModal() {
    modal.fadeOut(200);
    $('body').removeClass('placy-modal-open');
  }

  /**
   * Initialize Mapbox Map with Draw
   */
  function initializeMap() {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map = new mapboxgl.Map({
      container: 'mapbox-draw-map',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Initialize Mapbox Draw
    draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      defaultMode: 'draw_line_string',
      styles: [
        // Custom styling for drawn route
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#1e40af', // Dark blue
            'line-width': 4
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-halo-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': 8,
            'circle-color': '#FFF'
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#1e40af'
          }
        }
      ]
    });

    map.addControl(draw, 'top-left');

    // Listen for draw events
    map.on('draw.create', onDrawUpdate);
    map.on('draw.update', onDrawUpdate);
    map.on('draw.delete', onDrawDelete);
  }

  /**
   * Handle Draw Update Events
   */
  function onDrawUpdate(event) {
    if (event.features && event.features.length > 0) {
      currentFeature = event.features[0];
      updateCoordinatesCount();
    }
  }

  /**
   * Handle Draw Delete Events
   */
  function onDrawDelete() {
    currentFeature = null;
    updateCoordinatesCount();
  }

  /**
   * Update Coordinates Count Display
   */
  function updateCoordinatesCount() {
    // Get all features from draw and count total coordinates
    if (!draw) {
      $('#draw-coordinates-count').text(0);
      return;
    }
    
    const allFeatures = draw.getAll();
    let totalCoordinates = 0;
    
    allFeatures.features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
        totalCoordinates += feature.geometry.coordinates.length;
      }
    });
    
    $('#draw-coordinates-count').text(totalCoordinates);
    
    // Also update currentFeature reference if there's only one LineString
    const lineStrings = allFeatures.features.filter(f => f.geometry.type === 'LineString');
    if (lineStrings.length === 1) {
      currentFeature = lineStrings[0];
    }
  }

  /**
   * Load Existing Route into Draw
   */
  function loadExistingRoute() {
    const $field = getRouteGeometryField();
    const geoJSON = $field.val();

    if (geoJSON && geoJSON.trim() !== '') {
      try {
        const feature = JSON.parse(geoJSON);
        
        // Clear existing features
        draw.deleteAll();
        
        // Add existing feature
        const featureIds = draw.add(feature);
        
        if (featureIds && featureIds.length > 0) {
          currentFeature = draw.get(featureIds[0]);
          
          // Fit map to feature bounds
          const coordinates = feature.geometry.coordinates;
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.fitBounds(bounds, { padding: 50 });
          updateCoordinatesCount();
        }
      } catch (error) {
        console.error('Failed to load existing route:', error);
      }
    }
  }

  /**
   * Simplify LineString using Douglas-Peucker algorithm
   * Reduces number of points while preserving shape
   */
  function simplifyLineString(coordinates, tolerance = 0.0001) {
    if (coordinates.length <= 2) return coordinates;
    
    // Find point with max distance from line between first and last
    let maxDist = 0;
    let maxIndex = 0;
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    
    for (let i = 1; i < coordinates.length - 1; i++) {
      const dist = perpendicularDistance(coordinates[i], first, last);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    
    // If max distance is greater than tolerance, recursively simplify
    if (maxDist > tolerance) {
      const left = simplifyLineString(coordinates.slice(0, maxIndex + 1), tolerance);
      const right = simplifyLineString(coordinates.slice(maxIndex), tolerance);
      return left.slice(0, -1).concat(right);
    } else {
      return [first, last];
    }
  }
  
  /**
   * Calculate perpendicular distance from point to line
   */
  function perpendicularDistance(point, lineStart, lineEnd) {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const mag = Math.sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      const u = ((x - x1) * dx + (y - y1) * dy) / (mag * mag);
      const ix = x1 + u * dx;
      const iy = y1 + u * dy;
      const dx2 = x - ix;
      const dy2 = y - iy;
      return Math.sqrt(dx2 * dx2 + dy2 * dy2);
    }
    
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }

  /**
   * Save Route to ACF Field
   */
  function saveRoute() {
    // Small delay to ensure Mapbox Draw has processed the last point
    setTimeout(() => {
      const features = draw.getAll();
      
      if (!features || features.features.length === 0) {
        alert('Please draw a route before saving.');
        return;
      }
      
      processSave(features);
    }, 100);
  }
  
  /**
   * Process the actual save after delay
   */
  function processSave(features) {
    if (features.features.length === 0) {
      alert('No route found to save.');
      return;
    }

    let feature;
    
    // Find all LineString features
    const lineStrings = features.features.filter(f => f.geometry.type === 'LineString');
    
    if (lineStrings.length === 0) {
      alert('No valid LineString route found.');
      return;
    }
    
    if (lineStrings.length === 1) {
      // Single LineString - use it directly
      feature = lineStrings[0];
    } else {
      // Multiple LineStrings - MERGE them all into one route
      console.log('Merging', lineStrings.length, 'route segments into one...');
      
      // Collect all coordinates from all LineStrings
      let allCoordinates = [];
      lineStrings.forEach(ls => {
        allCoordinates = allCoordinates.concat(ls.geometry.coordinates);
      });
      
      // Create new merged feature
      feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: allCoordinates
        }
      };
      
      // Update the map to show the merged result
      draw.deleteAll();
      const newIds = draw.add(feature);
      
      if (newIds && newIds.length > 0) {
        currentFeature = draw.get(newIds[0]);
      }
      
      console.log('✓ Merged route:', allCoordinates.length, 'coordinates');
    }
    
    // Validate: must be LineString with at least 2 coordinates
    if (feature.geometry.type !== 'LineString' || feature.geometry.coordinates.length < 2) {
      alert('Route must have at least 2 points.');
      return;
    }

    const originalCount = feature.geometry.coordinates.length;
    
    // Simplify if too many points (>100)
    if (originalCount > 100) {
      const simplified = simplifyLineString(feature.geometry.coordinates, 0.0001);
      
      // Create new feature object with simplified coordinates
      feature = {
        type: 'Feature',
        properties: feature.properties || {},
        geometry: {
          type: 'LineString',
          coordinates: simplified
        }
      };
      
      showNotice(`Route simplified from ${originalCount} to ${simplified.length} points for optimal performance.`, 'info');
    }
    
    // Save to ACF hidden field
    const geoJSON = JSON.stringify(feature);
    const $field = getRouteGeometryField();
    
    if ($field.length === 0) {
      alert('Error: Could not find route_geometry_json field. Please refresh the page and try again.');
      return;
    }
    
    // Make field editable so WordPress can save the value
    makeFieldEditable();
    
    // Set value and trigger change events
    $field.val(geoJSON);
    $field.trigger('change');
    $field.trigger('input');
    $field.trigger('blur');
    
    // Mark WordPress post as modified (dirty) - Multiple strategies
    
    // Strategy 1: Gutenberg editor
    if (typeof wp !== 'undefined' && wp.data && wp.data.dispatch) {
      try {
        wp.data.dispatch('core/editor').editPost({ meta: {} });
        console.log('✓ Marked as dirty via Gutenberg API');
      } catch (e) {
        console.log('Not in Gutenberg editor');
      }
    }
    
    // Strategy 2: Classic Editor - Create a persistent dirty state marker
    let $markerField = $('#placy-route-changed-marker');
    if ($markerField.length === 0) {
      $markerField = $('<input type="hidden" id="placy-route-changed-marker" name="placy_route_changed" value="0">');
      $('#post').append($markerField);
    }
    
    // Change the marker value to trigger dirty state
    const newValue = parseInt($markerField.val() || '0') + 1;
    $markerField.val(newValue).trigger('change');
    
    // Strategy 3: Trigger WordPress autosave
    if (typeof wp !== 'undefined' && wp.autosave) {
      wp.autosave.server.triggerSave();
    }
    
    // Strategy 4: Force enable Update button
    const enableUpdateButton = () => {
      const $publish = $('#publish');
      const $savePost = $('#save-post');
      
      $publish.removeClass('disabled button-primary-disabled').prop('disabled', false);
      $savePost.removeClass('disabled button-primary-disabled').prop('disabled', false);
      
      // Change button text to indicate changes
      if ($publish.val() === 'Publish') {
        $publish.val('Update');
      }
    };
    
    enableUpdateButton();
    
    // Keep checking and re-enabling if WordPress tries to disable it
    const keepAliveInterval = setInterval(enableUpdateButton, 500);
    
    // Stop after 10 seconds or when post is saved
    setTimeout(() => clearInterval(keepAliveInterval), 10000);
    
    // Clear interval when form is submitted
    $('#post').one('submit', () => {
      clearInterval(keepAliveInterval);
    });
    
    // Trigger ACF change event (safely)
    if (typeof acf !== 'undefined' && acf.validation) {
      try {
        const validation = acf.validation.get($field);
        if (validation) {
          acf.validation.remove($field);
        }
      } catch (e) {
        console.log('ACF validation not applicable to this field');
      }
    }
    
    // Verify save
    setTimeout(() => {
      const savedValue = $field.val();
      
      if (savedValue && savedValue.length > 0) {
        // Parse to get final coordinate count
        let savedFeature = null;
        let finalCount = 0;
        
        try {
          savedFeature = JSON.parse(savedValue);
          finalCount = savedFeature.geometry.coordinates.length;
        } catch (e) {
          console.error('Error parsing saved value:', e);
        }
        
        // AJAX save directly to database
        const postId = $('#post_ID').val();
        
        if (postId && savedFeature) {
          const nonce = $('#_wpnonce').val() || $('#_ajax_nonce').val();
          
          $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
              action: 'save_route_geometry',
              post_id: postId,
              geometry_json: geoJSON,
              nonce: nonce
            },
            success: function(response) {
              if (response.success) {
                showNotice('✅ Route saved! (' + finalCount + ' points)', 'success');
                updatePreview(finalCount);
                currentFeature = savedFeature;
                closeDrawModal();
                setTimeout(makeFieldReadonly, 500);
              } else {
                showNotice('⚠️ Route updated. <strong>Click "Update" to save.</strong>', 'warning');
                updatePreview(finalCount);
                currentFeature = savedFeature;
                closeDrawModal();
              }
            },
            error: function(xhr, status, error) {
              console.error('AJAX save error:', error);
              showNotice('⚠️ Route updated. <strong>Click "Update" to save.</strong>', 'warning');
              updatePreview(finalCount);
              currentFeature = savedFeature;
              closeDrawModal();
            }
          });
        } else {
          // No post ID yet (new post)
          if (savedFeature) {
            updatePreview(finalCount);
            currentFeature = savedFeature;
          }
          closeDrawModal();
          showNotice('✅ Route saved! <strong>Click "Update" to save permanently.</strong>', 'success');
        }
      } else {
        alert('Error saving route. Please try again or refresh the page.');
      }
    }, 100);
  } // End of processSave

  /**
   * Clear Route
   */
  function clearRoute() {
    if (!confirm('Are you sure you want to clear the route?')) {
      return;
    }

    // Clear ACF field
    const $field = getRouteGeometryField();
    $field.val('').trigger('change');

    // Clear Draw
    if (draw) {
      draw.deleteAll();
    }

    currentFeature = null;

    // Update preview
    updatePreview(0);

    showNotice('Route cleared.', 'info');
  }

  /**
   * Update Preview Display
   */
  function updatePreview(coordinatesCount) {
    const preview = $('#mapbox-draw-preview');
    
    if (coordinatesCount > 0) {
      preview.show();
      $('#draw-coordinates-count').text(coordinatesCount);
      $('#edit-mapbox-draw, #clear-mapbox-draw').show();
    } else {
      preview.hide();
      $('#edit-mapbox-draw, #clear-mapbox-draw').hide();
    }
  }

  /**
   * Check for Existing Route on Page Load
   */
  function checkExistingRoute() {
    const $field = getRouteGeometryField();
    const geoJSON = $field.val();

    if (geoJSON && geoJSON.trim() !== '') {
      try {
        const feature = JSON.parse(geoJSON);
        const count = feature.geometry.coordinates.length;
        updatePreview(count);
      } catch (error) {
        console.error('Invalid GeoJSON in field:', error);
      }
    }
  }

  /**
   * Show Admin Notice
   */
  function showNotice(message, type = 'info') {
    const noticeHTML = `
      <div class="notice notice-${type} is-dismissible">
        <p>${message}</p>
      </div>
    `;
    
    $('.wrap h1').after(noticeHTML);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      $('.notice').fadeOut();
    }, 5000);
  }

  /**
   * Export Waypoints for Google Earth Studio
   */
  async function exportForEarthStudio() {
    console.log('exportForEarthStudio() START');
    
    try {
      // Show loading state
      const $button = $('#export-earth-studio');
      const originalText = $button.html();
      console.log('Button found:', $button.length);
      console.log('Original button text:', originalText);
      
      $button.prop('disabled', true).html('<span class="dashicons dashicons-update" style="animation: rotation 2s infinite linear;"></span> Exporting...');
      
      // Collect waypoint data
      console.log('Collecting waypoint data...');
      const waypointData = await collectWaypointData();
      console.log('Collected waypoints:', waypointData);
      
      if (!waypointData || waypointData.length === 0) {
        console.log('No waypoints found!');
        showNotice('No waypoints found. Please add waypoints before exporting.', 'error');
        $button.prop('disabled', false).html(originalText);
        return;
      }
      
      console.log(`Found ${waypointData.length} waypoints, formatting JSON...`);
      
      // Format as Earth Studio JSON
      const earthStudioJSON = formatEarthStudioJSON(waypointData);
      console.log('Formatted JSON:', earthStudioJSON);
      
      // Download JSON file
      console.log('Triggering download...');
      downloadJSON(earthStudioJSON);
      
      // Show success message
      showNotice(`Successfully exported ${waypointData.length} waypoints for Google Earth Studio!`, 'success');
      
      // Reset button
      $button.prop('disabled', false).html(originalText);
      
      console.log('exportForEarthStudio() COMPLETE');
      
    } catch (error) {
      console.error('Export error:', error);
      console.error('Error stack:', error.stack);
      showNotice(`Export failed: ${error.message}`, 'error');
      $('#export-earth-studio').prop('disabled', false).html('<span class="dashicons dashicons-download"></span> Export for Google Earth Studio');
    }
  }

  /**
   * Collect Waypoint Data from ACF Repeater
   */
  async function collectWaypointData() {
    console.log('collectWaypointData() START');
    const waypoints = [];
    const $repeaterRows = $('.acf-field[data-name="route_waypoints"] .acf-row:not(.acf-clone)');
    
    console.log('Found repeater rows:', $repeaterRows.length);
    
    if ($repeaterRows.length === 0) {
      console.log('No repeater rows found');
      return waypoints;
    }
    
    // Process each waypoint row
    const promises = [];
    $repeaterRows.each(function(index) {
      const $row = $(this);
      
      // Try multiple selectors to find the POI select field
      let $poiSelect = $row.find('select[data-name="related_poi"]');
      if ($poiSelect.length === 0) {
        $poiSelect = $row.find('select[name*="related_poi"]');
      }
      if ($poiSelect.length === 0) {
        $poiSelect = $row.find('.acf-field[data-name="related_poi"] select');
      }
      
      const poiId = $poiSelect.val();
      
      console.log(`Row ${index}:`);
      console.log('  - Found select:', $poiSelect.length);
      console.log('  - Select element:', $poiSelect[0]);
      console.log('  - POI ID:', poiId);
      
      if (poiId) {
        promises.push(
          fetchPOICoordinates(poiId).then(poiData => {
            console.log(`POI ${poiId} data:`, poiData);
            if (poiData) {
              return {
                waypointNumber: index + 1,
                poiId: poiId,
                name: poiData.name,
                latitude: poiData.latitude,
                longitude: poiData.longitude,
                description: poiData.description
              };
            }
            return null;
          })
        );
      }
    });
    
    // Wait for all POI data to be fetched
    const results = await Promise.all(promises);
    
    // Filter out null results (POIs without coordinates)
    return results.filter(item => item !== null);
  }

  /**
   * Fetch POI Coordinates via REST API
   */
  async function fetchPOICoordinates(poiId) {
    try {
      // Use GraphQL instead of REST API (ACF fields are exposed via WPGraphQL)
      const baseUrl = window.location.origin + window.location.pathname.split('/wp-admin')[0];
      const graphqlUrl = `${baseUrl}/graphql`;
      
      console.log(`Fetching POI ${poiId} via GraphQL from:`, graphqlUrl);
      
      const query = `
        query GetPOI($id: ID!) {
          poi(id: $id, idType: DATABASE_ID) {
            id
            title
            poiFields {
              poiLatitude
              poiLongitude
              poiDescription
            }
          }
        }
      `;
      
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: { id: poiId.toString() }
        })
      });
      
      if (!response.ok) {
        console.warn(`GraphQL request failed for POI ${poiId} - Status: ${response.status}`);
        return null;
      }
      
      const result = await response.json();
      console.log(`POI ${poiId} GraphQL response:`, result);
      
      if (result.errors) {
        console.error(`GraphQL errors for POI ${poiId}:`, result.errors);
        return null;
      }
      
      const poi = result.data?.poi;
      if (!poi) {
        console.warn(`POI ${poiId} not found in GraphQL response`);
        return null;
      }
      
      const poiFields = poi.poiFields || {};
      const latitude = poiFields.poiLatitude;
      const longitude = poiFields.poiLongitude;
      
      console.log(`POI ${poiId} extracted coords:`, {latitude, longitude});
      
      if (!latitude || !longitude) {
        console.warn(`POI ${poiId} (${poi.title}) missing coordinates`);
        return null;
      }
      
      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        console.warn(`POI ${poiId} has invalid coordinates: ${latitude}, ${longitude}`);
        return null;
      }
      
      return {
        name: poi.title || `POI ${poiId}`,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: poiFields.poiDescription || ''
      };
      
    } catch (error) {
      console.error(`Error fetching POI ${poiId}:`, error);
      return null;
    }
  }

  /**
   * Format data as Earth Studio JSON
   */
  function formatEarthStudioJSON(waypoints) {
    // Get story title and slug
    const storyTitle = $('#title').val() || 'Route Story';
    const storySlug = $('#post_name').val() || $('#editable-post-name').text() || 'route-story';
    
    // Calculate recommended duration (3 seconds per waypoint)
    const recommendedDuration = waypoints.length * 3;
    
    return {
      projectName: `${storyTitle} - Flyover`,
      projectSlug: storySlug,
      exportDate: new Date().toISOString(),
      totalWaypoints: waypoints.length,
      recommendedDuration: recommendedDuration,
      waypoints: waypoints,
      settings: {
        defaultAltitude: 300, // meters above ground
        smoothing: 'high',
        cameraMode: 'follow-path',
        notes: 'Generated from Placy WP Route Story. Import into Google Earth Studio for automatic flyover generation.'
      }
    };
  }

  /**
   * Download JSON file
   */
  function downloadJSON(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `${data.projectSlug}-earth-studio-${timestamp}.json`;
    
    const $link = $('<a>')
      .attr({
        href: url,
        download: filename
      })
      .css('display', 'none');
    
    $('body').append($link);
    $link[0].click();
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      $link.remove();
    }, 100);
  }

})(jQuery);
