import { Http } from "@nativescript/core";

export default class MapBoxService {
    static baseUrl: string = "https://api.mapbox.com/"
    static accessToken = "pk.eyJ1Ijoib3NjYXJsZDA5MCIsImEiOiJja2l4OGFhcTgweHNtMnhydzhuNGZuazlrIn0.hkw7WVA78y3mILSY-ibYKQ"

    static searchByPlace(searchQuery: string, userLoc: string) {
        let url = this.baseUrl + "geocoding/v5/mapbox.places/" + searchQuery + ".json?" + userLoc +
            "&types=poi,address,neighborhood,place&access_token=" +
            this.accessToken;
        return Http.getJSON(url)
    }

    static directions(profile,coordinates: string) {
        let url = this.baseUrl + "directions/v5/mapbox/"+profile+"/" +coordinates+"?access_token=" +
            this.accessToken + "&steps=true&geometries=geojson";
        console.log(url)
        return Http.request({
            url: url,
            method: 'get',
            //headers: { "Content-Type": "application/x-www-form-urlencoded" },
            //content: 'coordinates='+coordinates
        })
    }
}