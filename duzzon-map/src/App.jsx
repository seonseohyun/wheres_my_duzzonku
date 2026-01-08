import { useEffect } from "react";

function App() {
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.log("카카오 SDK 아직 안 불러짐");
      return;
    }

    window.kakao.maps.load(() => {
      const container = document.getElementById("map");

      if (!container) {
        console.log("map div 없음");
        return;
      }

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      };

      new window.kakao.maps.Map(container, options);
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default App;
