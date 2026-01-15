import { useEffect, useRef } from "react";
import "./App.css";
import storeData from "./data/stores.json";

function App() {
  const mapRef = useRef(null);

  // 🖲️ 커스텀 마커 이미지 (SVG)
  // Known: 진한 쿠키색, Rumor: 회색/불투명
  const MARKER_SVG_KNOWN = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#D2691E" stroke="white" stroke-width="2"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-weight="bold">🍪</text>
    </svg>`;

  const MARKER_SVG_RUMOR = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#A9A9A9" fill-opacity="0.6" stroke="white" stroke-width="2"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-weight="bold">?</text>
    </svg>`;

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("map");

      // 🛑 이미 지도가 생성되었으면 다시 생성하지 않음 (React StrictMode 방지)
      if (mapRef.current) {
        return;
      }

      const center = new window.kakao.maps.LatLng(35.19341, 126.82032); // 광주
      const map = new window.kakao.maps.Map(container, {
        center,
        level: 8,
        draggable: true, // 드래그 이동 가능 명시
        scrollwheel: true // 휠 줌 가능 명시
      });
      mapRef.current = map; // 지도 인스턴스 저장

      // 🛑 현재 열린 오버레이 추적용 변수 (싱글톤 패턴)
      let activeOverlay = null;

      // 🗺️ 맵 배경 클릭 시 현재 열린 오버레이 닫기 (이벤트 리스너 1회만 등록)
      window.kakao.maps.event.addListener(map, "click", () => {
        if (activeOverlay) {
          activeOverlay.setMap(null);
          activeOverlay = null;
        }
      });

      storeData.forEach((store) => {
        const markerPosition = new window.kakao.maps.LatLng(store.lat, store.lng);

        // 🎨 커스텀 마커 생성 (모두 동일한 아이콘 사용)
        const svgContent = MARKER_SVG_KNOWN;
        const markerImageSize = new window.kakao.maps.Size(40, 40);
        const markerImageOptions = { offset: new window.kakao.maps.Point(20, 20) };

        // Blob 또는 DataURI로 변환하지 않고 카카오맵은 Image URL을 요구하므로
        // SVG 문자열을 Data URI로 변환
        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

        const markerImage = new window.kakao.maps.MarkerImage(
          svgDataUrl,
          markerImageSize,
          markerImageOptions
        );

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          image: markerImage,
          map: map,
        });

        // 🖼️ 커스텀 오버레이 (인포윈도우 대신 사용)
        // CSS 클래스 'custom-overlay'를 사용하여 스타일링
        const content = document.createElement('div');
        content.className = 'custom-overlay';
        content.innerHTML = `
          <div class="overlay-card">
            <div class="overlay-header" style="border-bottom: none; justify-content: center; position: relative;">
                <span class="store-name" style="font-size: 16px;">${store.name}</span>
                <span class="close-btn" title="닫기" style="position: absolute; right: 10px;">✖</span>
            </div>
          </div>
        `;

        const overlay = new window.kakao.maps.CustomOverlay({
          content: content,
          map: null, // 처음엔 숨김
          position: marker.getPosition(),
          yAnchor: 1.2, // 마커 위쪽에 표시
          zIndex: 3
        });

        // 닫기 버튼 이벤트
        const closeBtn = content.querySelector('.close-btn');
        closeBtn.onclick = () => {
          overlay.setMap(null);
          // 닫았으므로 activeOverlay가 나라면 null 처리
          if (activeOverlay === overlay) {
            activeOverlay = null;
          }
        };

        // 📍 마커 클릭 시 오버레이 열기 (이전 오버레이 닫기)
        window.kakao.maps.event.addListener(marker, "click", () => {
          if (activeOverlay) {
            activeOverlay.setMap(null); // 기존 열린거 닫기
          }
          overlay.setMap(map); // 새로 열기
          activeOverlay = overlay; // 추적 업데이트

          map.panTo(markerPosition);
        });

        // (REMOVE: 맵 클릭 리스너 제거됨)
      });
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div id="map" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default App;
