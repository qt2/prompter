import {
  ChangeEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { IoPause, IoPlay } from "react-icons/io5";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { clamp, displayTime, useAnimationFrame } from "./utils";
import { Editor } from "./components/editor";
import { RiFontSize, RiSpeedUpFill } from "react-icons/ri";
import { useHotkeys } from "react-hotkeys-hook";

export const playingState = atom<boolean>({
  key: "playing",
  default: false,
});

export const editingState = atom<boolean>({
  key: "editing",
  default: false,
});

export const yState = atom<number>({
  key: "y",
  default: 0,
});

export const heightState = atom<number>({
  key: "height",
  default: 1080,
});

export const speedState = atom<number>({
  key: "speed",
  default: 20,
});

export const fontSizeState = atom<number>({
  key: "fontSize",
  default: 36,
});

let previousTime: number;
let previousScrollY: number;

function App() {
  const [playing, setPlaying] = useRecoilState(playingState);
  const [editing] = useRecoilState(editingState);
  const [height, setHeight] = useRecoilState(heightState);
  const [y, setY] = useRecoilState(yState);
  const speed = useRecoilValue(speedState);
  const [fontSize] = useRecoilState(fontSizeState);
  const ref = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const now = performance.now();
    const delta = now - previousTime;
    previousTime = now;

    const scrollY = window.scrollY;
    if (scrollY !== previousScrollY) {
      setY(scrollY);
    } else {
      if (playing) {
        setY((y) => y + speed * delta * 0.001);
      }
      window.scroll({ top: y, behavior: "instant" });
    }

    const height = ref.current?.scrollHeight;
    if (height) {
      if (y >= height && playing) {
        setPlaying(false);
        console.log("done");
      }
      setY((y) => clamp(y, 0, height));
    }

    previousScrollY = window.scrollY;
  }, [playing, y, speed]);

  useAnimationFrame(update);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((el) => {
        if (height !== el.contentRect.height) {
          setHeight(el.contentRect.height);
        }
      });
    });
    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useHotkeys("Space", (event) => {
    event.preventDefault();
    setPlaying((playing) => !playing);
  });

  return (
    <>
      <div
        className="absolute top-0 w-full"
        style={{ height: `calc(100dvh + ${height}px)` }}
      ></div>
      <div className="fixed top-0 h-dvh overflow-y-hidden">
        <div
          className="sticky top-0"
          style={{
            transform: `translate(0, calc(50dvh - ${y}px))`,
            fontSize: `${fontSize}px`,
          }}
          ref={ref}
        >
          <Editor />
        </div>

        <div
          className={`pointer-events-none duration-200 ${
            editing ? "opacity-0" : ""
          }`}
        >
          <div className="fixed top-0 w-full h-[calc(50%_-_24rem)] bg-base-100/80"></div>
          <div className="fixed top-[calc(50%_-24rem)] w-full h-48 bg-gradient-to-b from-base-100/80"></div>
          <div className="fixed bottom-0 w-full h-[calc(50%_-_24rem)] bg-base-100/80"></div>
          <div className="fixed bottom-[calc(50%_-24rem)] w-full h-48 bg-gradient-to-t from-base-100/80"></div>
        </div>

        <ControlBar />
      </div>
    </>
  );
}

function ControlBar() {
  const [playing, setPlaying] = useRecoilState(playingState);
  const [speed, setSpeed] = useRecoilState(speedState);
  const [fontSize, setFontSize] = useRecoilState(fontSizeState);
  const [y, setY] = useRecoilState(yState);
  const height = useRecoilValue(heightState);

  const progress = y / height;
  const totalTime = height / speed;
  const currentTime = y / speed;

  const togglePlaying = () => setPlaying((playing) => !playing);
  const setProgress: ChangeEventHandler<HTMLInputElement> = (event) =>
    setY(height * Number(event.currentTarget.value));

  return (
    <nav className="fixed bottom-0 sm:bottom-4 left-1/2 -translate-x-1/2 w-full max-w-screen-sm px-6 py-3 rounded-xl bg-base-100 drop-shadow-xl">
      <div className="flex items-center gap-2">
        <div
          className="tooltip"
          data-tip={`${playing ? "Pause" : "Play"} (Space)`}
        >
          <button
            className={`btn btn-sm ${
              playing ? "btn-secondary" : "btn-primary"
            }`}
            onClick={togglePlaying}
          >
            {playing ? (
              <>
                <IoPause />
                PAUSE
              </>
            ) : (
              <>
                <IoPlay />
                PLAY
              </>
            )}
          </button>
        </div>

        <div className="grow"></div>

        <span>
          <span className="font-semibold">{displayTime(currentTime)}</span> /{" "}
          {displayTime(totalTime)}
        </span>
        <div className="flex">
          <ControlBarMenu icon={<RiSpeedUpFill />}>
            <span className="font-semibold">Speed</span>
            <div className="mt-2 flex items-center gap-2">
              <button
                className="btn btn-sm btn-square text-xl"
                onClick={() => setSpeed((speed) => speed - 1)}
              >
                -
              </button>
              <span className="font-semibold">{speed}</span>
              <button
                className="btn btn-sm btn-square text-xl"
                onClick={() => setSpeed((speed) => speed + 1)}
              >
                +
              </button>
            </div>
          </ControlBarMenu>
          <ControlBarMenu icon={<RiFontSize />}>
            <span className="font-semibold">Font Size</span>
            <div className="mt-2 flex items-center gap-2">
              <button
                className="btn btn-sm btn-square text-xl"
                onClick={() => setFontSize((fontSize) => fontSize - 1)}
              >
                -
              </button>
              <span className="font-semibold">{fontSize}</span>
              <button
                className="btn btn-sm btn-square text-xl"
                onClick={() => setFontSize((fontSize) => fontSize + 1)}
              >
                +
              </button>
            </div>
          </ControlBarMenu>
        </div>
      </div>
      <input
        type="range"
        className={`range ${
          playing ? "range-secondary" : "range-primary"
        } w-full h-2 no-thumb`}
        max={1}
        step="any"
        value={progress}
        onChange={setProgress}
      />
    </nav>
  );
}

function ControlBarMenu({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="dropdown dropdown-top dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-sm btn-ghost btn-square text-lg"
      >
        {icon}
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-10 p-4 rounded bg-base-100 drop-shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}

export default App;
