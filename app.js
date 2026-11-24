const map = L.map('map', {
    worldCopyJump: false
}).setView([20, 0], 2);


const markers = [];
const cities = [];

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true
}).addTo(map);

map.setMaxBounds([
    [-90, -180],
    [90, 180]
]);

Papa.parse('data/temperature.csv', {
    download: true,
    header: true,

    complete: function (results) {
        let total = 0;
let completed = 0;

        console.log("CSV読込成功");
        console.log(results.data);

       results.data.forEach(row => {

    if (!row.latitude || !row.longitude) return;

    total++;

    if (row["取得状況"] === "取得済") {
        completed++;
    }

    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);

    const rate = ((completed / total) * 100).toFixed(1);

document.getElementById("stats").innerHTML = `
総地点数: ${total}
取得済: ${completed}
未取得: ${total - completed}
取得率: ${rate}%
`;

            const color =
                row["取得状況"] === "取得済"
                    ? "green"
                    : "red";

            markers.push([lat, lng]);
            cities.push({
    city: row.city,
    country: row.country,
    lat: lat,
    lng: lng
});

const marker = L.circleMarker(
    [lat, lng],
    {
        radius: 6,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
    }
)
.addTo(map)
.bindPopup(`
    <b>${row.city}</b>
    国: ${row.country}
    最高気温: ${row.max_temp}℃
    最低気温: ${row.min_temp}℃
    状況: ${row["取得状況"]}
`);    
 cities.push({
    city: row.city,
    country: row.country,
    lat: lat,
    lng: lng,
    marker: marker
});
     

        });

    }
});
function searchCity() {

    const keyword =
        document.getElementById("citySearch")
        .value
        .toLowerCase();

    const city =
        cities.find(c =>
            c.city &&
            c.city.toLowerCase().includes(keyword)
        );

    if (city) {

        map.flyTo(
            [city.lat, city.lng],
            8
        );

        setTimeout(() => {

            city.marker.openPopup();

        }, 1000);

    } else {

        alert("都市が見つかりません");

    }
}

console.log("検索機能開始");

document
.getElementById("citySearch")
.addEventListener("keypress", function(e) {

    if (e.key === "Enter") {
        searchCity();
    }

});
const searchInput =
    document.getElementById("citySearch");

const suggestions =
    document.getElementById("suggestions");

searchInput.addEventListener("input", function () {

    const keyword =
        this.value.toLowerCase();

    suggestions.innerHTML = "";

    if (keyword.length === 0) {
        return;
    }

    const matches =
        cities.filter(city =>
            city.city &&
            city.city.toLowerCase().includes(keyword)
        );

    matches.slice(0, 10).forEach(city => {

        const div =
            document.createElement("div");

        div.className =
            "suggestion-item";

        div.textContent =
            `${city.city} (${city.country})`;

        div.addEventListener("click", () => {

    searchInput.value = city.city;
    suggestions.innerHTML = "";

    map.flyTo([city.lat, city.lng], 10);

    // 少し待ってからポップアップを開く
    setTimeout(() => {

        map.eachLayer(layer => {

            if (
                layer instanceof L.CircleMarker &&
                layer.getLatLng().lat === city.lat &&
                layer.getLatLng().lng === city.lng
            ) {
                layer.openPopup();
            }

        });

    }, 500);

});

        suggestions.appendChild(div);

    });

});