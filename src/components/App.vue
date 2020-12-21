<template>
  <Page>
    <ActionBar title="Welcome to NativeScript-Vue!">
      <ActionItem
        @tap="onMapStyle('Street')"
        ios.position="right"
        text="Street"
        android.position="popup"
      />
      <ActionItem
        @tap="onMapStyle('Dark')"
        ios.position="right"
        text="Dark"
        android.position="popup"
      />
      <ActionItem
        @tap="onMapStyle('Light')"
        ios.position="right"
        text="Light"
        android.position="popup"
      />
      <ActionItem
        @tap="onMapStyle('SatStreets')"
        ios.position="right"
        text="Satellital Streets"
        android.position="popup"
      />
    </ActionBar>
    <GridLayout columns="*,auto" rows="auto,*,auto">
      <SearchBar
        hint="Search by address or place"
        :text="searchPhrase"
        @submit="onSubmit"
        v-model="searchQuery"
        col="0"
        row="0"
        colSpan="2"
      />
      <MapboxView
        ref="mapbox"
        class="message"
        text=""
        col="0"
        row="1"
        colSpan="2"
        rowSpan="2"
        :accessToken="accessTokenMap"
        latitude="21.150598"
        longitude="-101.696047"
        zoomLevel="13"
        showUserLocation="true"
        @mapReady="onMapReady"
      >
      </MapboxView>
      <fab
        @tap="onLocation"
        col="0"
        row="1"
        rippleColor="#f1f1f1"
        class="fab-button color-default fa"
        >{{ "fa-dot-circle-o" | fonticon }}</fab
      >
      <fab
        @tap="goTo"
        col="0"
        row="2"
        rippleColor="#f1f1f1"
        class="fab-button color-primary fa"
        >{{ "fa-map" | fonticon }}</fab
      >
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { action, alert } from "@nativescript/core/ui/dialogs";
import {
  MapboxMarker,
  MapboxViewApi,
  MapStyle,
} from "@nativescript-community/ui-mapbox";
import * as geolocation from "nativescript-geolocation";
import MapBoxService from "@/services/MapBoxService.ts";

@Component({
  components: {},
  filters: {},
})
export default class App extends Vue {
  searchPhrase = "";
  searchQuery = "";
  userLocation = {};
  accessTokenMap = MapBoxService.accessToken;
  marker = null;
  $refs!: {
    mapbox: HTMLFormElement;
  };

  mounted() {}

  onMapReady(event) {
    //console.log("onMapReady", event.map);
  }
  onSubmit() {
    let vm = this;
    geolocation
      .getCurrentLocation({
        desiredAccuracy: 3,
        updateDistance: 10,
        maximumAge: 20000,
        timeout: 20000,
      })
      .then((loc) => {
        let userLoc = "";
        if (loc) {
          userLoc = `&proximity=${JSON.stringify(
            loc.longitude
          )},${JSON.stringify(loc.latitude)}`;
        } else {
          userLoc = "";
        }
        MapBoxService.searchByPlace(vm.searchQuery, userLoc).then(function (
          res
        ) {
          vm.openPlacesList(res["features"]);
        });
      });
  }
  openPlacesList(places: object[]) {
    let vm = this;
    this.$gotToModal("PlacesModal", {
      places: places,
    }).then(function (data) {
      let mapboxView = vm.$refs.mapbox.nativeView;
      let mapbox = mapboxView.getMapboxApi();
      let place = data;
      let lat = place.geometry.coordinates[1];
      let lng = place.geometry.coordinates[0];
      vm.marker = place;
      mapbox.removeMarkers();

      mapbox.addMarkers([
        {
          lat: lat,
          lng: lng,
          title: place.text,
          subtitle: place.place_name,
          selected: true, // makes the callout show immediately when the marker is added (note: only 1 marker can be selected at a time)
          onCalloutTap: function () {
            console.log("'Nice location' marker callout tapped");
          },
        },
      ]);
      mapbox.setCenter({
        lat: lat, // mandatory
        lng: lng, // mandatory
        animated: true, // default true
      });
    });
  }

  onLocation() {
    let mapboxView = this.$refs.mapbox.nativeView;
    let mapbox = mapboxView.getMapboxApi();
    let vm = this;
    mapbox.getUserLocation().then(function (userLocation) {
      mapbox.setCenter({
        lat: userLocation.location.lat, // mandatory
        lng: userLocation.location.lng, // mandatory
        animated: true, // default true
      });
    });
  }

  goTo() {
    let mapboxView = this.$refs.mapbox.nativeView;
    let mapbox = mapboxView.getMapboxApi();
    let vm = this;

    if (vm.marker == null) {
      alert("Select a starting point").then(() => {});
      return;
    }

    action("Directions", "Cancel", ["walking", "cycling", "driving"]).then(
      (result) => {
        mapbox.removePolylines();
        let coordinates_array = [];
        mapbox.getUserLocation().then(function (userLocation) {
          MapBoxService.directions(
            result,
            vm.marker.geometry.coordinates[0] +
              "," +
              vm.marker.geometry.coordinates[1] +
              ";" +
              userLocation.location.lng +
              "," +
              userLocation.location.lat
          ).then(function (res) {
            let json = res["content"] + "";
            let steps = JSON.parse(json).routes[0].legs[0].steps;
            console.log(JSON.parse(json).routes[0].legs[0]["geometry"]);
            for (let i = 1; i < steps.length; i++) {
              let coordinates = steps[i]["geometry"]["coordinates"];
              for (let i = 0; i < coordinates.length; i++) {
                let lat = coordinates[i][1];
                let lng = coordinates[i][0];
                coordinates_array.push({
                  lat: coordinates[i][1],
                  lng: coordinates[i][0],
                });
              }
            }
           
            mapbox.addPolyline({
              id: 1, // optional, can be used in 'removePolylines'
              color: "#336699", // Set the color of the line (default black)
              width: 7, // Set the width of the line (default 5)
              opacity: 0.6, //Transparency / alpha, ranging 0-1. Default fully opaque (1).
              points: coordinates_array,
            });
          });
        });
      }
    );
  }

  onMapStyle(style: string) {
    let mapboxView = this.$refs.mapbox.nativeView;
    let mapbox = mapboxView.getMapboxApi();
    switch (style) {
      case "Street": {
        mapbox.setMapStyle(MapStyle.STREETS);
        break;
      }
      case "Light": {
        mapbox.setMapStyle(MapStyle.LIGHT);
        break;
      }
      case "Dark": {
        mapbox.setMapStyle(MapStyle.DARK);
        break;
      }
      case "SatStreets": {
        mapbox.setMapStyle(MapStyle.SATELLITE_STREETS);
        break;
      }
    }
  }
}
</script>

<style scoped>
.fab-button {
  height: 60;
  width: 60;
  margin: 0 15 15 15;
  horizontal-align: right;
  vertical-align: bottom;
}

.color-default {
  background-color: #fff;
  color: #30bcff;
}

.color-primary {
  background-color: #30bcff;
  color: white;
}
</style>
