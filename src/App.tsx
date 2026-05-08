import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileText,
  Home,
  LineChart,
  LoaderCircle,
  Lock,
  MonitorSmartphone,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  StretchHorizontal,
  UserRound,
} from "lucide-react";

const symptoms = [
  {
    icon: UserRound,
    title: "首が前に出る",
    text: "スマホやPCを見続ける姿勢で、ストレートネック気味の見た目につながることがあります。",
  },
  {
    icon: StretchHorizontal,
    title: "肩の高さが違う",
    text: "左右どちらかに体重をかける癖や、片側だけの荷物でバランスが崩れやすくなります。",
  },
  {
    icon: Activity,
    title: "背中が丸まりやすい",
    text: "長時間の座り姿勢では、顔・肩・胸の位置関係が崩れやすくなります。",
  },
];

const habits = [
  "スマホを見るときに顔だけを下げる",
  "椅子に浅く座って背中を丸める",
  "片肘をついて作業する",
  "同じ肩にだけバッグをかける",
];

const checkItems = [
  "ストレートネック傾向",
  "猫背傾向",
  "頭の傾き",
  "肩の左右バランス",
  "体幹の傾き",
];

const faqs = [
  {
    question: "カメラ映像は保存されますか？",
    answer:
      "保存しません。初期MVPでは、測定日時とスコアのみを端末内のlocalStorageに保存します。",
  },
  {
    question: "医療的な診断ですか？",
    answer:
      "医療診断ではありません。カメラ上で確認できる姿勢の傾向をセルフチェックするための目安です。",
  },
  {
    question: "スマホでも使えますか？",
    answer:
      "スマホ縦画面を優先して設計します。実機ではHTTPS環境でカメラ動作を確認していきます。",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const privacySections = [
  {
    title: "取得する情報",
    body: "初期MVPでは、測定日時、各項目スコア、総合スコア、最も低かった項目を端末内のlocalStorageに保存します。カメラ映像、画像、動画は保存しません。",
  },
  {
    title: "カメラの利用",
    body: "カメラは姿勢ランドマークを検出するために利用します。ブラウザ上で処理し、映像そのものをサーバーへ送信する設計にはしていません。",
  },
  {
    title: "履歴の保存と削除",
    body: "履歴は利用中のブラウザ内に保存されます。ユーザーは履歴画面から削除できます。ブラウザデータ削除、端末容量不足、PWA再インストール、プライベートブラウズ等により履歴が消える場合があります。",
  },
  {
    title: "アクセス解析・エラー収集",
    body: "公開時には、利用状況の把握のためCloudflare Web Analytics、エラー把握のためSentryを利用する予定です。導入時は取得内容を必要最小限にします。",
  },
  {
    title: "免責",
    body: "表示されるスコアやコメントは、医療的な診断値ではありません。痛みや強い違和感がある場合は、医療機関や専門家へ相談してください。",
  },
];

const termsSections = [
  {
    title: "サービスの目的",
    body: "シセイキレイは、カメラ上で確認できる顔・肩・上半身の位置関係から、姿勢の傾向をセルフチェックするためのWebアプリです。",
  },
  {
    title: "医療行為ではないこと",
    body: "本サービスの結果は、病気や症状の診断、治療、予防、医学的判断を行うものではありません。健康上の不安がある場合は医師等の専門家へ相談してください。",
  },
  {
    title: "利用環境",
    body: "カメラ、ブラウザ、端末性能、明るさ、服装、背景などにより、検出精度やスコアが変わる場合があります。結果はあくまで目安として利用してください。",
  },
  {
    title: "禁止事項",
    body: "サービスの不正利用、過度なアクセス、第三者の権利を侵害する行為、法令に違反する行為を禁止します。",
  },
  {
    title: "履歴データ",
    body: "初期MVPでは履歴を端末内に保存します。永続性は保証されません。ユーザー自身で履歴削除を行うことができます。",
  },
  {
    title: "規約の変更",
    body: "本サービスの改善や公開状況に応じて、本規約の内容を変更する場合があります。",
  },
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/measure" element={<MeasurePage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route
        path="/privacy"
        element={
          <DocumentPage
            title="プライバシーポリシー"
            lead="シセイキレイは、姿勢の傾向をセルフチェックするためにカメラを使用します。カメラ映像・画像・動画は保存しません。"
            sections={privacySections}
          />
        }
      />
      <Route
        path="/terms"
        element={
          <DocumentPage
            title="利用規約"
            lead="本サービスは、カメラ上で確認できる姿勢の傾向を可視化するセルフチェックツールです。医療的な診断や治療を目的としたものではありません。"
            sections={termsSections}
          />
        }
      />
    </Routes>
  );
}

function HomePage() {
  return (
    <main className="app">
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <section className="hero">
        <nav className="nav" aria-label="メインナビゲーション">
          <Link className="brand" to="/">
            <span className="brandMark">
              <Sparkles size={18} />
            </span>
            <span>シセイキレイ</span>
          </Link>
          <div className="navLinks">
            <a className="navLink" href="#faq">
              Q&A
            </a>
            <Link className="navLink" to="/history">
              履歴
            </Link>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">
              <MonitorSmartphone size={16} />
              スマホでできる姿勢セルフチェック
            </p>
            <h1>首や腰の違和感、まずは姿勢の傾向から見てみませんか。</h1>
            <p className="lead">
              シセイキレイは、カメラで顔・肩・上半身のバランスを見ながら、ストレートネックや猫背などの姿勢傾向をチェックするWebアプリです。
            </p>
            <div className="heroActions">
              <Link className="primaryButton" to="/measure">
                姿勢チェックを始める
                <ArrowRight size={18} />
              </Link>
              <a className="secondaryButton" href="#learn">
                姿勢について読む
              </a>
            </div>
            <div className="trustList" aria-label="サービスの特徴">
              <span>
                <Camera size={16} />
                30秒目安
              </span>
              <span>
                <Lock size={16} />
                映像保存なし
              </span>
              <span>
                <LineChart size={16} />
                履歴グラフ対応
              </span>
            </div>
          </div>

          <div className="previewCard" aria-label="姿勢チェック画面のイメージ">
            <div className="phoneFrame">
              <div className="cameraArea">
                <span className="faceGuide" />
                <span className="shoulderGuide" />
              </div>
              <div className="scorePanel">
                <div>
                  <p>姿勢スコア</p>
                  <strong>78</strong>
                </div>
                <span className="scoreBadge">+16 改善</span>
              </div>
              <div className="miniChart">
                <span style={{ height: "48%" }} />
                <span style={{ height: "68%" }} />
                <span style={{ height: "56%" }} />
                <span style={{ height: "82%" }} />
                <span style={{ height: "74%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro" id="learn">
        <div className="sectionHeading">
          <p className="eyebrow">Posture Basics</p>
          <h2>ストレートネックや猫背は、毎日の小さな姿勢から気づけます。</h2>
          <p>
            首が痛い、腰が痛いと感じるとき、その原因を一つに決めつけることはできません。ただ、長時間の座り姿勢やスマホ姿勢が、首・肩・腰への負担につながることがあります。
          </p>
        </div>
        <div className="symptomGrid">
          {symptoms.map((item) => (
            <article className="infoCard" key={item.title}>
              <span className="iconBubble">
                <item.icon size={22} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section splitSection">
        <div className="contentBlock">
          <p className="eyebrow">Bad Habits</p>
          <h2>これを続けると、姿勢が崩れやすくなります。</h2>
          <p>
            どれも日常の中でよくある動きです。まずは自分に当てはまるものがないか、軽く確認してみてください。
          </p>
        </div>
        <div className="habitList">
          {habits.map((habit) => (
            <div className="habitItem" key={habit}>
              <CheckCircle2 size={20} />
              <span>{habit}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section checkSection">
        <div className="checkCard">
          <div>
            <p className="eyebrow">Self Check</p>
            <h2>カメラで見られる姿勢の傾向</h2>
            <p>
              正面カメラで顔と肩の位置を見ながら、上半身のバランスをチェックします。
            </p>
          </div>
          <div className="checkList">
            {checkItems.map((item) => (
              <span key={item}>
                <ChevronRight size={16} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section privacyNote">
        <ShieldCheck size={30} />
        <div>
          <h2>カメラ映像は保存しません</h2>
          <p>
            シセイキレイは、医療診断ではなく姿勢の傾向を確認するセルフチェックです。保存するのはスコアと測定日時のみで、履歴は端末内に保存されます。
          </p>
        </div>
      </section>

      <section className="section faq" id="faq">
        <div className="sectionHeading">
          <p className="eyebrow">Q&A</p>
          <h2>よくある質問</h2>
        </div>
        <div className="faqList">
          {faqs.map((faq) => (
            <details className="faqItem" key={faq.question}>
              <summary>
                <span>
                  <CircleHelp size={18} />
                  {faq.question}
                </span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div>
          <span className="brand footerBrand">
            <span className="brandMark">
              <Moon size={16} />
            </span>
            シセイキレイ
          </span>
          <p>姿勢の変化に気づくためのセルフチェックツール</p>
        </div>
        <Link className="primaryButton compact" to="/measure">
          姿勢チェックを始める
          <ArrowRight size={16} />
        </Link>
      </footer>
    </main>
  );
}

type CameraStatus = "idle" | "loading" | "ready" | "error";
type MeasurementStage = "setup" | "countdown" | "measuring" | "action" | "complete";
type MeasurementRound = "before" | "after";

type DetectionState = {
  hasPose: boolean;
  faceVisible: boolean;
  shouldersVisible: boolean;
  centered: boolean;
  shouldersInFrame: boolean;
  message: string;
};

const initialDetectionState: DetectionState = {
  hasPose: false,
  faceVisible: false,
  shouldersVisible: false,
  centered: false,
  shouldersInFrame: false,
  message: "カメラを起動してください。",
};

const poseModelUrl =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

const wasmFilesetUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

type ScoreKey =
  | "stoop"
  | "straightNeck"
  | "trunkTilt"
  | "shoulderBalance"
  | "headTilt";

type ScoreSet = Record<ScoreKey, number>;

type MeasurementResult = {
  measurementId: string;
  measuredAt: string;
  version: 1;
  scores: ScoreSet;
  totalScore: number;
  worstItem: ScoreKey;
};

type BeforeAfterResult = {
  before: MeasurementResult;
  after: MeasurementResult;
};

const scoreLabels: Record<ScoreKey, string> = {
  stoop: "猫背傾向",
  straightNeck: "ストレートネック傾向",
  trunkTilt: "体幹の傾き",
  shoulderBalance: "肩の左右差",
  headTilt: "頭の傾き",
};

const improvementActions: Record<ScoreKey, string> = {
  stoop: "肩を軽く後ろに引いて、胸を少し開いてください。",
  straightNeck: "顎を軽く引いて、耳が肩の上に乗る意識を持ってください。",
  trunkTilt: "左右のお尻に均等に体重を乗せてください。",
  shoulderBalance: "両肩の力を抜いて、肩の高さをそろえてください。",
  headTilt: "頭を少しだけ真ん中に戻し、目線を正面に合わせてください。",
};

const measurementStorageKey = "shisei-kirei:measurements";

function MeasurePage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const measureTimerRef = useRef<number | null>(null);
  const activeMeasurementRef = useRef(false);
  const sampleBufferRef = useRef<NormalizedLandmark[][]>([]);
  const beforeResultRef = useRef<MeasurementResult | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [detectionState, setDetectionState] = useState<DetectionState>(initialDetectionState);
  const [stage, setStage] = useState<MeasurementStage>("setup");
  const [round, setRound] = useState<MeasurementRound>("before");
  const [countdown, setCountdown] = useState(3);
  const [beforeResult, setBeforeResult] = useState<MeasurementResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isMeasureReady =
    cameraStatus === "ready" &&
    detectionState.faceVisible &&
    detectionState.shouldersVisible &&
    detectionState.centered &&
    detectionState.shouldersInFrame;

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
      }
      if (measureTimerRef.current !== null) {
        window.clearTimeout(measureTimerRef.current);
      }
      poseLandmarkerRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setErrorMessage("このブラウザではカメラを起動できません。別のブラウザでお試しください。");
      return;
    }

    setCameraStatus("loading");
    setDetectionState({
      ...initialDetectionState,
      message: "カメラを起動しています。",
    });
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus("ready");
      await startPoseDetection();
    } catch {
      setCameraStatus("error");
      setDetectionState({
        ...initialDetectionState,
        message: "カメラを起動できませんでした。",
      });
      setErrorMessage("カメラの使用を許可してください。ブラウザの設定からカメラ権限を確認できます。");
    }
  }

  async function startPoseDetection() {
    if (!videoRef.current) {
      return;
    }

    setIsVisionLoading(true);

    try {
      if (!poseLandmarkerRef.current) {
        const vision = await FilesetResolver.forVisionTasks(wasmFilesetUrl);
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: poseModelUrl,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      runPoseDetectionLoop();
    } catch {
      setDetectionState({
        ...initialDetectionState,
        message: "姿勢検出モデルを読み込めませんでした。通信環境を確認して再度お試しください。",
      });
      setErrorMessage("MediaPipeの読み込みに失敗しました。通信環境を確認して再度お試しください。");
    } finally {
      setIsVisionLoading(false);
    }
  }

  function runPoseDetectionLoop() {
    const video = videoRef.current;
    const landmarker = poseLandmarkerRef.current;

    if (!video || !landmarker) {
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.landmarks[0];
      setDetectionState(analyzePoseLandmarks(landmarks));

      if (activeMeasurementRef.current && landmarks) {
        sampleBufferRef.current.push(landmarks);
      }
    }

    animationFrameRef.current = requestAnimationFrame(runPoseDetectionLoop);
  }

  function startMeasurement() {
    if (!isMeasureReady || stage === "countdown" || stage === "measuring") {
      return;
    }

    setCountdown(3);
    setStage("countdown");

    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          if (countdownTimerRef.current !== null) {
            window.clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }

          beginMeasurementWindow();
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  function beginMeasurementWindow() {
    sampleBufferRef.current = [];
    activeMeasurementRef.current = true;
    setStage("measuring");

    measureTimerRef.current = window.setTimeout(() => {
      activeMeasurementRef.current = false;
      finishMeasurement();
    }, 5000);
  }

  function finishMeasurement() {
    const result = createMeasurementResult(sampleBufferRef.current);

    if (!result) {
      setStage("setup");
      setDetectionState({
        ...detectionState,
        message: "測定中に姿勢を検出できませんでした。顔と肩を合わせてもう一度お試しください。",
      });
      return;
    }

    if (round === "before") {
      beforeResultRef.current = result;
      setBeforeResult(result);
      setStage("action");
      return;
    }

    const before = beforeResultRef.current;

    if (!before) {
      setStage("setup");
      setRound("before");
      return;
    }

    const beforeAfter = {
      before,
      after: result,
    };

    saveMeasurementHistory(result);
    setStage("complete");
    navigate("/result", { state: beforeAfter });
  }

  function startAfterMeasurement() {
    setRound("after");
    setStage("setup");
  }

  return (
    <main className="app pageShell">
      <SimpleHeader />

      <section className="measureLayout">
        <div className="measureCopy">
          <p className="eyebrow">
            <Camera size={16} />
            Camera Setup
          </p>
          <h1>顔と肩が枠内に入る位置で、カメラをセットしてください。</h1>
          <p className="lead">
            正面を向いて座り、顔と左右の肩が画面に入るように調整します。映像は保存されません。
          </p>

          <div className="measureSteps" aria-label="測定準備の手順">
            <div>
              <span>1</span>
              <p>明るい場所で正面を向く</p>
            </div>
            <div>
              <span>2</span>
              <p>顔と肩をガイド内に合わせる</p>
            </div>
            <div>
              <span>3</span>
              <p>準備できたら測定へ進む</p>
            </div>
          </div>

          <div className="heroActions">
            <button
              className="primaryButton"
              type="button"
              onClick={startCamera}
              disabled={cameraStatus === "loading" || isVisionLoading}
            >
              {cameraStatus === "loading" || isVisionLoading ? (
                <>
                  <LoaderCircle className="spinIcon" size={18} />
                  {cameraStatus === "loading" ? "起動中" : "検出準備中"}
                </>
              ) : (
                <>
                  カメラを起動する
                  <Camera size={18} />
                </>
              )}
            </button>
            <button
              className="secondaryButton"
              type="button"
              onClick={startMeasurement}
              disabled={!isMeasureReady || stage === "countdown" || stage === "measuring"}
            >
              {round === "before" ? "測定開始" : "再測定開始"}
              <Play size={17} />
            </button>
          </div>

          {stage === "countdown" && (
            <div className="measurementStatus">
              <span>{countdown}</span>
              <p>姿勢をそのままキープしてください</p>
            </div>
          )}
          {stage === "measuring" && (
            <div className="measurementStatus measuring">
              <LoaderCircle className="spinIcon" size={24} />
              <p>5秒間測定しています</p>
            </div>
          )}
          {stage === "action" && beforeResult && (
            <div className="actionCard">
              <p className="eyebrow">Improve</p>
              <h2>今一番崩れているのは「{scoreLabels[beforeResult.worstItem]}」です</h2>
              <p>{improvementActions[beforeResult.worstItem]}</p>
              <button className="primaryButton" type="button" onClick={startAfterMeasurement}>
                改善姿勢で再測定する
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {cameraStatus === "ready" && (
            <p className={`statusMessage ${isMeasureReady ? "success" : "warning"}`}>
              {detectionState.message}
            </p>
          )}
          {cameraStatus === "error" && <p className="statusMessage error">{errorMessage}</p>}

          <div className="detectionChecklist" aria-label="測定開始条件">
            <DetectionBadge label="顔が検出されている" active={detectionState.faceVisible} />
            <DetectionBadge label="左右の肩が検出されている" active={detectionState.shouldersVisible} />
            <DetectionBadge label="顔が中央にある" active={detectionState.centered} />
            <DetectionBadge label="肩が画面内に収まっている" active={detectionState.shouldersInFrame} />
          </div>
        </div>

        <div className="measureCameraCard">
          <div className="liveCameraFrame">
            {cameraStatus === "idle" && (
              <div className="cameraEmpty">
                <Camera size={42} />
                <p>カメラを起動すると、ここに映像が表示されます。</p>
              </div>
            )}
            <video
              ref={videoRef}
              className="cameraVideo"
              playsInline
              muted
              aria-label="姿勢チェック用カメラ映像"
            />
            <div className="measureOverlay" aria-hidden="true">
              <span className="measureFaceGuide" />
              <span className="measureShoulderGuide" />
              <span className="measureCenterLine" />
            </div>
          </div>
          <div className="cameraHints">
            <span>
              <UserRound size={16} />
              {detectionState.faceVisible ? "顔を検出中" : "顔を中央に合わせる"}
            </span>
            <span>
              <StretchHorizontal size={16} />
              {detectionState.shouldersVisible ? "肩を検出中" : "肩を画面内に入れる"}
            </span>
            <span>
              <ShieldCheck size={16} />
              映像保存なし
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetectionBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={active ? "detectionBadge active" : "detectionBadge"}>
      <CheckCircle2 size={16} />
      {label}
    </span>
  );
}

function analyzePoseLandmarks(landmarks?: NormalizedLandmark[]): DetectionState {
  if (!landmarks) {
    return {
      ...initialDetectionState,
      message: "顔と肩を枠内に収めてください。",
    };
  }

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  const faceVisible = isVisibleLandmark(nose);
  const shouldersVisible = isVisibleLandmark(leftShoulder) && isVisibleLandmark(rightShoulder);
  const centered = faceVisible && nose.x > 0.35 && nose.x < 0.65 && nose.y > 0.08 && nose.y < 0.42;
  const shouldersInFrame =
    shouldersVisible &&
    isInsideFrame(leftShoulder, 0.04) &&
    isInsideFrame(rightShoulder, 0.04) &&
    leftShoulder.y > 0.32 &&
    rightShoulder.y > 0.32;

  if (!faceVisible) {
    return {
      hasPose: true,
      faceVisible,
      shouldersVisible,
      centered,
      shouldersInFrame,
      message: "顔を中央に合わせてください。",
    };
  }

  if (!shouldersVisible || !shouldersInFrame) {
    return {
      hasPose: true,
      faceVisible,
      shouldersVisible,
      centered,
      shouldersInFrame,
      message: "肩が見える位置に調整してください。",
    };
  }

  if (!centered) {
    return {
      hasPose: true,
      faceVisible,
      shouldersVisible,
      centered,
      shouldersInFrame,
      message: "顔をガイド枠の中央に合わせてください。",
    };
  }

  return {
    hasPose: true,
    faceVisible,
    shouldersVisible,
    centered,
    shouldersInFrame,
    message: "測定を開始できます。姿勢をそのままキープしてください。",
  };
}

function isVisibleLandmark(landmark?: NormalizedLandmark) {
  return Boolean(landmark && landmark.visibility > 0.45 && isInsideFrame(landmark, 0));
}

function isInsideFrame(landmark: NormalizedLandmark, margin: number) {
  return (
    landmark.x >= margin &&
    landmark.x <= 1 - margin &&
    landmark.y >= margin &&
    landmark.y <= 1 - margin
  );
}

function createMeasurementResult(samples: NormalizedLandmark[][]): MeasurementResult | null {
  const scoreSamples = samples
    .map((landmarks) => calculateScores(landmarks))
    .filter((scores): scores is ScoreSet => Boolean(scores));

  if (scoreSamples.length < 10) {
    return null;
  }

  const scores = scoreKeys.reduce((acc, key) => {
    acc[key] = median(scoreSamples.map((sample) => sample[key]));
    return acc;
  }, {} as ScoreSet);
  const totalScore = Math.round(
    scoreKeys.reduce((sum, key) => sum + scores[key], 0) / scoreKeys.length,
  );
  const worstItem = scoreKeys.reduce((worst, key) => (scores[key] < scores[worst] ? key : worst));

  return {
    measurementId: crypto.randomUUID(),
    measuredAt: new Date().toISOString(),
    version: 1,
    scores,
    totalScore,
    worstItem,
  };
}

const scoreKeys: ScoreKey[] = [
  "stoop",
  "straightNeck",
  "trunkTilt",
  "shoulderBalance",
  "headTilt",
];

function calculateScores(landmarks: NormalizedLandmark[]): ScoreSet | null {
  const nose = landmarks[0];
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (!isVisibleLandmark(nose) || !isVisibleLandmark(leftShoulder) || !isVisibleLandmark(rightShoulder)) {
    return null;
  }

  const shoulderWidth = Math.max(distance(leftShoulder, rightShoulder), 0.01);
  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const eyeOrEarLeft = isVisibleLandmark(leftEar) ? leftEar : leftEye;
  const eyeOrEarRight = isVisibleLandmark(rightEar) ? rightEar : rightEye;
  const faceWidth =
    isVisibleLandmark(eyeOrEarLeft) && isVisibleLandmark(eyeOrEarRight)
      ? Math.max(distance(eyeOrEarLeft, eyeOrEarRight), 0.01)
      : shoulderWidth * 0.45;

  const hipCenter =
    isVisibleLandmark(leftHip) && isVisibleLandmark(rightHip) ? midpoint(leftHip, rightHip) : null;
  const shoulderBalancePenalty = (Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth) * 180;
  const headTiltPenalty =
    isVisibleLandmark(eyeOrEarLeft) && isVisibleLandmark(eyeOrEarRight)
      ? (Math.abs(eyeOrEarLeft.y - eyeOrEarRight.y) / faceWidth) * 150
      : Math.abs(nose.x - shoulderCenter.x) * 90;
  const trunkTiltPenalty = hipCenter
    ? (Math.abs(shoulderCenter.x - hipCenter.x) / shoulderWidth) * 110
    : (Math.abs(nose.x - shoulderCenter.x) / shoulderWidth) * 60;
  const neckPenalty = (Math.abs(nose.x - shoulderCenter.x) / shoulderWidth) * 70 + headTiltPenalty * 0.25;
  const headToShoulderRatio = (shoulderCenter.y - nose.y) / shoulderWidth;
  const stoopPenalty = Math.abs(headToShoulderRatio - 1.15) * 38 + shoulderBalancePenalty * 0.12;

  return {
    stoop: toScore(stoopPenalty),
    straightNeck: toScore(neckPenalty),
    trunkTilt: toScore(trunkTiltPenalty),
    shoulderBalance: toScore(shoulderBalancePenalty),
    headTilt: toScore(headTiltPenalty),
  };
}

function midpoint(a: NormalizedLandmark, b: NormalizedLandmark) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility, b.visibility),
  };
}

function distance(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return Math.round(sorted[middle]);
}

function toScore(penalty: number) {
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

function saveMeasurementHistory(result: MeasurementResult) {
  try {
    const current = readMeasurementHistory();
    localStorage.setItem(measurementStorageKey, JSON.stringify([result, ...current].slice(0, 50)));
  } catch {
    // localStorageが使えない環境では、測定体験だけ継続する。
  }
}

function readMeasurementHistory() {
  return JSON.parse(localStorage.getItem(measurementStorageKey) ?? "[]") as MeasurementResult[];
}

function ResultPage() {
  const location = useLocation();
  const result = location.state as BeforeAfterResult | null;

  if (!result?.before || !result.after) {
    return (
      <PlaceholderPage
        eyebrow="Result"
        icon={Activity}
        title="まだ測定結果がありません"
        description="姿勢チェックを完了すると、Before / Afterのスコア変化をここで確認できます。"
      />
    );
  }

  const delta = result.after.totalScore - result.before.totalScore;

  return (
    <main className="app pageShell">
      <SimpleHeader />
      <section className="resultLayout">
        <div className="resultHero">
          <p className="eyebrow">
            <Activity size={16} />
            Before / After
          </p>
          <h1>{delta >= 0 ? `+${delta}点改善しました` : `${Math.abs(delta)}点下がりました`}</h1>
          <p className="lead">
            画面内で検出できた姿勢ランドマークをもとにしたセルフチェック結果です。医療的な診断ではありません。
          </p>
          <div className="scoreCompare">
            <ScoreCircle label="Before" score={result.before.totalScore} />
            <ArrowRight size={24} />
            <ScoreCircle label="After" score={result.after.totalScore} highlight />
          </div>
          <div className="heroActions">
            <Link className="primaryButton" to="/measure">
              もう一度測る
              <Camera size={18} />
            </Link>
            <Link className="secondaryButton" to="/history">
              履歴を見る
              <LineChart size={18} />
            </Link>
          </div>
        </div>

        <div className="resultCard">
          <h2>項目別スコア</h2>
          <RadarChart before={result.before.scores} after={result.after.scores} />
          <div className="scoreRows">
            {scoreKeys.map((key) => (
              <div className="scoreRow" key={key}>
                <div>
                  <strong>{scoreLabels[key]}</strong>
                  <span>
                    {result.before.scores[key]} → {result.after.scores[key]}
                  </span>
                </div>
                <div className="scoreBar" aria-hidden="true">
                  <span style={{ width: `${result.after.scores[key]}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="actionCard compactAction">
            <p className="eyebrow">Next Hint</p>
            <h3>次に意識したい項目</h3>
            <p>{improvementActions[result.after.worstItem]}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function ScoreCircle({
  label,
  score,
  highlight = false,
}: {
  label: string;
  score: number;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "scoreCircle highlight" : "scoreCircle"}>
      <span>{label}</span>
      <strong>{score}</strong>
    </div>
  );
}

function RadarChart({ before, after }: { before: ScoreSet; after: ScoreSet }) {
  const center = 120;
  const radius = 92;
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const axes = scoreKeys.map((key, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / scoreKeys.length;
    return {
      key,
      label: scoreLabels[key],
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      labelX: center + Math.cos(angle) * (radius + 28),
      labelY: center + Math.sin(angle) * (radius + 28),
    };
  });

  function polygonPoints(scores: ScoreSet) {
    return scoreKeys
      .map((key, index) => {
        const angle = -Math.PI / 2 + (index * 2 * Math.PI) / scoreKeys.length;
        const valueRadius = radius * (scores[key] / 100);
        return `${center + Math.cos(angle) * valueRadius},${center + Math.sin(angle) * valueRadius}`;
      })
      .join(" ");
  }

  return (
    <div className="radarWrap" aria-label="Before After レーダーチャート">
      <svg className="radarChart" viewBox="0 0 240 240" role="img">
        {gridLevels.map((level) => (
          <polygon
            key={level}
            className="radarGrid"
            points={axes
              .map((axis) => `${center + (axis.x - center) * level},${center + (axis.y - center) * level}`)
              .join(" ")}
          />
        ))}
        {axes.map((axis) => (
          <g key={axis.key}>
            <line className="radarAxis" x1={center} y1={center} x2={axis.x} y2={axis.y} />
            <text className="radarLabel" x={axis.labelX} y={axis.labelY}>
              {axis.label}
            </text>
          </g>
        ))}
        <polygon className="radarBefore" points={polygonPoints(before)} />
        <polygon className="radarAfter" points={polygonPoints(after)} />
      </svg>
      <div className="radarLegend">
        <span className="beforeDot">Before</span>
        <span className="afterDot">After</span>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState<MeasurementResult[]>([]);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      setHistory(readMeasurementHistory());
    } catch {
      setStorageError(true);
    }
  }, []);

  function deleteHistory() {
    try {
      localStorage.removeItem(measurementStorageKey);
      setHistory([]);
    } catch {
      setStorageError(true);
    }
  }

  const chronological = [...history].reverse();
  const latest = history[0];
  const previous = history[1];
  const delta = latest && previous ? latest.totalScore - previous.totalScore : null;

  return (
    <main className="app pageShell">
      <SimpleHeader />
      <section className="historyLayout">
        <div className="resultHero">
          <p className="eyebrow">
            <LineChart size={16} />
            History
          </p>
          <h1>姿勢スコアの変化</h1>
          <p className="lead">
            測定履歴はこの端末内に保存されます。ブラウザデータ削除やプライベートブラウズでは消える可能性があります。
          </p>

          {storageError && (
            <p className="statusMessage warning">
              localStorageを利用できないため、履歴保存なしで測定のみ利用できます。
            </p>
          )}

          {latest ? (
            <div className="historySummary">
              <ScoreCircle label="最新スコア" score={latest.totalScore} highlight />
              <div>
                <strong>{delta === null ? "初回記録です" : delta >= 0 ? `前回より+${delta}点` : `前回より${delta}点`}</strong>
                <p>前回との差分を見ながら、次の測定につなげられます。</p>
              </div>
            </div>
          ) : (
            <div className="emptyHistory">
              <LineChart size={36} />
              <p>まだ履歴がありません。姿勢チェックを完了するとここに表示されます。</p>
            </div>
          )}

          <div className="heroActions">
            <Link className="primaryButton" to="/measure">
              姿勢チェックを始める
              <Camera size={18} />
            </Link>
            <button className="secondaryButton" type="button" onClick={deleteHistory} disabled={!history.length}>
              履歴を削除
            </button>
          </div>
        </div>

        <div className="resultCard">
          <h2>総合スコア推移</h2>
          <div className="historyChart" aria-label="総合スコア推移">
            {chronological.length ? (
              chronological.map((item) => (
                <div className="historyBar" key={item.measurementId}>
                  <span style={{ height: `${item.totalScore}%` }} />
                  <small>{item.totalScore}</small>
                </div>
              ))
            ) : (
              <p className="mutedText">測定後にグラフが表示されます。</p>
            )}
          </div>

          {latest && (
            <>
              <h3>最新の項目別スコア</h3>
              <div className="scoreRows">
                {scoreKeys.map((key) => (
                  <div className="scoreRow" key={key}>
                    <div>
                      <strong>{scoreLabels[key]}</strong>
                      <span>{latest.scores[key]}</span>
                    </div>
                    <div className="scoreBar" aria-hidden="true">
                      <span style={{ width: `${latest.scores[key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

type PlaceholderPageProps = {
  eyebrow: string;
  icon: typeof Camera;
  title: string;
  description: string;
};

function PlaceholderPage({
  eyebrow,
  icon: Icon,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="app pageShell">
      <SimpleHeader />
      <section className="placeholder">
        <span className="iconBubble largeIcon">
          <Icon size={30} />
        </span>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        <div className="heroActions">
          <Link className="primaryButton" to="/">
            トップに戻る
            <Home size={18} />
          </Link>
          <Link className="secondaryButton" to="/measure">
            姿勢チェックへ
          </Link>
        </div>
      </section>
    </main>
  );
}

type DocumentSection = {
  title: string;
  body: string;
};

function DocumentPage({
  title,
  lead,
  sections,
}: {
  title: string;
  lead: string;
  sections: DocumentSection[];
}) {
  return (
    <main className="app pageShell">
      <SimpleHeader />
      <article className="documentPage">
        <span className="iconBubble largeIcon">
          <FileText size={28} />
        </span>
        <h1>{title}</h1>
        <p>{lead}</p>
        <div className="documentSections">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <Link className="secondaryButton" to="/">
          トップに戻る
        </Link>
      </article>
    </main>
  );
}

function SimpleHeader() {
  return (
    <nav className="nav simpleNav" aria-label="メインナビゲーション">
      <Link className="brand" to="/">
        <span className="brandMark">
          <Sparkles size={18} />
        </span>
        <span>シセイキレイ</span>
      </Link>
      <Link className="navLink" to="/">
        トップ
      </Link>
    </nav>
  );
}

export default App;
