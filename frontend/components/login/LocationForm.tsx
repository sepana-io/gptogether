import clsx from "clsx";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "components/atoms";

// Mapbox main map
import "mapbox-gl/dist/mapbox-gl.css";
const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");

/** Geocoder plugin */
const MapboxGeocoder = require("@mapbox/mapbox-gl-geocoder");
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API;

export default function LocationForm({ formik, initialValue }: any) {
  const mapContainer = useRef<any>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [zoom, setZoom] = useState(14);

  const setupMap = (
    center: any = [
      _.get(initialValue, "location.longitude"),
      _.get(initialValue, "location.latitude"),
    ]
  ) => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: center,
      zoom: zoom,
    });
    map.current.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      })
    );
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        // showUserHeading: true,
      })
    );
    marker.current = new mapboxgl.Marker().setLngLat(center).addTo(map.current);

    /**
     * Set new values
     */
    formik.handleChange({
      target: {
        name: "location",
        value: { longitude: center[0], latitude: center[1] },
      },
    });
  };

  // const successNewLocation = (position: any) => {
  //   setupMap([position.coords.longitude, position.coords.latitude]);
  // };

  useEffect(() => {
    setupMap();
    // navigator.geolocation.getCurrentPosition(
    //   successNewLocation,
    //   () => setupMap(),
    //   { enableHighAccuracy: true }
    // );
  }, []);

  /**
   * Update map move
   */
  useEffect(() => {
    if (!map.current) return;

    map.current.on("move", () => {
      const longitude = map.current.getCenter().lng.toFixed(4);
      const latitude = map.current.getCenter().lat.toFixed(4);
      const mapZoom = map.current.getZoom().toFixed(2);

      formik.handleChange({
        target: { name: "location", value: { longitude, latitude } },
      });
      setZoom(mapZoom);
      marker.current.setLngLat([longitude, latitude]);
    });
  });

  return (
    <>
      <Text size="text-size_title1" className="font-semibold mb-[8px]">
        Your Location
      </Text>
      <Text size="text-size_body1" color="text-gray-700" className="mb-[24px]">
        This will help you find similar user on location as well
      </Text>
      <div
        ref={mapContainer}
        className="h-[400px] bg-gray-200 rounded-[12px] mb-[40px]"
      />
    </>
  );
}
