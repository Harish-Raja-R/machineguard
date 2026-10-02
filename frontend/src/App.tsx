import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

const API = import.meta.env.VITE_API_HOST
  ? `https://${import.meta.env.VITE_API_HOST}`
  : (import.meta.env.VITE_API_BASE ?? "http://localhost:8000");

type Model = {
  id: string;
  name: string;
  status: string;
  deployable: boolean;
  model_version: string | null;
  reason: string;
};

type ModelResult = {
  model: string;
  display_name?: string;
  prediction: "normal" | "anomaly" | "NORMAL" | "ANOMALY";
  anomaly_score: number;
  threshold: number;
  processing_time_ms?: number;
  available?: boolean;
  error?: string;
};

type Prediction = {
  prediction: "normal" | "anomaly" | "NORMAL" | "ANOMALY";
  anomaly_score: number;
  threshold: number;
  machine_type: string;
  machine_id: string;
  model: string;
  model_version: string;
  processing_time_ms: number;
  audio_duration_seconds: number;
  sample_rate: number;
  spectrogram_url: string;
  explanation_url: string | null;
  attention_available?: boolean;
  waveform?: number[];
  history_id?: number;

  model_results?: ModelResult[];

  agreement?: {
    normal: number;
    anomaly: number;
    total: number;
    text?: string;
  };

  prediction_basis?: string;
};

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* -------------------------------------------------------------------------- */
/* APP SHELL                                                                   */
/* -------------------------------------------------------------------------- */

function AppShell() {
  const location = useLocation();

  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    get<{ models: Model[] }>("/api/models")
      .then((data) => setModels(data.models))
      .catch(() => setModels([]));
  }, []);

  const pageName =
    location.pathname === "/"
      ? "Overview"
      : location.pathname.slice(1).replace("/", " / ");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">MG</span>

          <span>
            <strong>MACHINEGUARD</strong>
            <small>ACOUSTIC MONITORING</small>
          </span>
        </Link>

        <div className="side-label">WORKSPACE</div>

        <nav className="side-nav">
          {["/", "/analyze", "/history"].map((path) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
            >
              <span className="nav-dot" />
              {path === "/" ? "Overview" : path.slice(1)}
            </NavLink>
          ))}
        </nav>

        <div className="side-label">RESEARCH</div>

        <nav className="side-nav">
          {[
            "/experiments",
            "/robustness",
            "/errors",
            "/research",
            "/about",
          ].map((path) => (
            <NavLink key={path} to={path}>
              <span className="nav-dot" />
              {path.slice(1)}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="status-light" /> LOCAL / CPU
          <br />
          <small>FIXED PROTOCOL 42</small>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <span className="crumb">
            MACHINEGUARD <b>/</b>{" "}
            {pageName.toUpperCase()}
          </span>

          <span className="top-status">
            <span className="status-light" />
            SYSTEM READY
          </span>
        </header>

        <main className="page">
          <Routes>
            <Route
              path="/"
              element={<Home models={models} />}
            />

            <Route
              path="/analyze"
              element={<Analyze models={models} />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/experiments"
              element={<Experiments />}
            />

            <Route
              path="/robustness"
              element={<Robustness />}
            />

            <Route
              path="/errors"
              element={<Errors />}
            />

            <Route
              path="/research"
              element={<Research />}
            />

            <Route
              path="/about"
              element={<About models={models} />}
            />

            <Route
              path="*"
              element={<Home models={models} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>

      {note && (
        <span className="heading-note">
          {note}
        </span>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span
      className={`badge ${value
        .toLowerCase()
        .replace(/\s+/g, "_")}`}
    >
      {value.replace("_", " ")}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* HOME                                                                        */
/* -------------------------------------------------------------------------- */

function Home({
  models,
}: {
  models: Model[];
}) {
  const navigate = useNavigate();

  const liveModels = models.filter(
    (model) => model.deployable
  );

  return (
    <div className="home-view">
      <section className="home-intro">
        <div>
          <span className="eyebrow">
            INDUSTRIAL ACOUSTIC ANALYSIS / FAN ID_00
          </span>

          <h1>
            Acoustic intelligence
            <br />
            <em>
              for machine condition monitoring.
            </em>
          </h1>

          <p className="lede">
            A fixed-protocol workstation for measuring
            anomaly scores from real industrial fan
            recordings.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/analyze")}
          >
            ANALYZE AUDIO <span>-&gt;</span>
          </button>
        </div>

        <div className="signal-glyph">
          <div className="glyph-ring ring-one" />
          <div className="glyph-ring ring-two" />
          <div className="glyph-core" />

          <span>
            16 kHz
            <br />
            MONO
          </span>
        </div>
      </section>

      <section className="readout-grid">
        <Metric label="MACHINE" value="FAN" />
        <Metric label="MACHINE ID" value="ID_00" />
        <Metric
          label="DATASET"
          value="MIMII / DCASE 2020"
        />
        <Metric label="INFERENCE" value="CPU" />
      </section>

      <section className="home-lower">
        <div>
          <span className="eyebrow">
            LIVE CAPABILITY
          </span>

          <h2>
            {liveModels.length} artifact-backed models
            available
          </h2>

          <div className="model-list">
            {liveModels.map((model) => (
              <div
                className="model-line"
                key={model.id}
              >
                <span className="status-light" />

                <b>{model.name}</b>

                <code>
                  {model.model_version ?? "-"}
                </code>

                <StatusBadge value="live" />
              </div>
            ))}

            {!liveModels.length && (
              <p className="method-note">
                No deployable models reported by the
                backend.
              </p>
            )}
          </div>
        </div>

        <div>
          <span className="eyebrow">
            EVIDENCE INDEX
          </span>

          <h2>Research surfaces</h2>

          <div className="link-grid">
            <Link to="/experiments">
              Experiment metrics{" "}
              <span>-&gt;</span>
            </Link>

            <Link to="/robustness">
              Noise robustness{" "}
              <span>-&gt;</span>
            </Link>

            <Link to="/errors">
              Error analysis{" "}
              <span>-&gt;</span>
            </Link>

            <Link to="/research">
              Methodology <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* WAVEFORM                                                                    */
/* -------------------------------------------------------------------------- */

function Waveform({
  values,
}: {
  values: number[];
}) {
  if (!values?.length) {
    return null;
  }

  const points = values
    .map(
      (value, index) =>
        `${(index /
          Math.max(values.length - 1, 1)) *
          100},${
          50 -
          Math.max(
            -1,
            Math.min(1, value * 10)
          ) *
            42
        }`
    )
    .join(" ");

  return (
    <svg
      className="waveform"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline points={points} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* ANALYZE                                                                     */
/* -------------------------------------------------------------------------- */

function Analyze({
  models,
}: {
  models: Model[];
}) {
  const liveModels = models.filter(
    (model) => model.deployable
  );

  const [model, setModel] =
    useState("all");

  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<Prediction | null>(null);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  async function analyze() {
    if (!file) {
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);

    const form = new FormData();

    form.append("file", file);
    form.append("model", model);

    try {
      const response = await fetch(
        `${API}/api/predict`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!response.ok) {
        let message = "Prediction failed";

        try {
          const body =
            await response.json();

          message =
            body.detail ?? message;
        } catch {
          message =
            await response.text();
        }

        throw new Error(message);
      }

      const data =
        (await response.json()) as Prediction;

      setResult(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Prediction failed"
      );
    } finally {
      setBusy(false);
    }
  }

  const decision =
    result?.prediction?.toLowerCase() ?? "";

  return (
    <div>
      <SectionHeading
        eyebrow="LIVE INFERENCE / FIXED THRESHOLD"
        title="Analyze audio"
        note="WAV / 25 MB MAX"
      />

      <div className="analysis-layout">
        {/* INPUT */}
        <section className="upload-panel">
          <span className="eyebrow">
            01 / INPUT RECORDING
          </span>

          <label className="drop-zone">
            <input
              type="file"
              accept=".wav,audio/wav"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] ??
                    null
                )
              }
            />

            <span className="upload-icon">
              +
            </span>

            <b>
              {file
                ? file.name
                : "Choose a WAV recording"}
            </b>

            <small>
              {file
                ? `${(
                    file.size / 1024
                  ).toFixed(
                    1
                  )} KB / ready for analysis`
                : "10-second window / mono or stereo accepted"}
            </small>
          </label>

          <label className="field-label">
            LIVE MODEL

            <select
              value={model}
              onChange={(event) =>
                setModel(
                  event.target.value
                )
              }
            >
              <option value="all">
                ALL DEPLOYED MODELS /
                COMPARISON
              </option>

              {liveModels.map((item) => (
                <option
                  value={item.id}
                  key={item.id}
                >
                  {item.name} /{" "}
                  {item.model_version ??
                    "-"}
                </option>
              ))}
            </select>
          </label>

          <button
            className="primary-button wide"
            disabled={
              !file ||
              busy ||
              !liveModels.length
            }
            onClick={analyze}
          >
            {busy
              ? "PROCESSING..."
              : "RUN ANALYSIS ->"}
          </button>

          {error && (
            <div className="error-text">
              {error}
            </div>
          )}

          <p className="method-note">
            Prediction is generated using trained
            MachineGuard artifacts and fixed evaluation
            thresholds. Input is converted to mono,
            resampled to 16 kHz, and processed as a
            deterministic 10-second window.
          </p>
        </section>

        {/* VISUALIZATION */}
        <section className="visual-panel">
          <span className="eyebrow">
            02 / TIME-FREQUENCY VIEW
          </span>

          {result ? (
            <>
              {result.waveform &&
                result.waveform.length >
                  0 && (
                  <div className="visual-block">
                    <span className="visual-label">
                      WAVEFORM / NORMALIZED
                      DISPLAY
                    </span>

                    <Waveform
                      values={
                        result.waveform
                      }
                    />
                  </div>
                )}

              <div className="visual-block">
                <span className="visual-label">
                  LOG-MEL / 64 BINS
                </span>

                {result.spectrogram_url && (
                  <img
                    className="analysis-image"
                    src={`${API}${result.spectrogram_url}`}
                    alt="Log-Mel spectrogram"
                  />
                )}
              </div>

              {result.explanation_url && (
                <div className="visual-block">
                  <span className="visual-label">
                    MODEL ATTRIBUTION
                  </span>

                  <img
                    className="analysis-image"
                    src={`${API}${result.explanation_url}`}
                    alt="Model attribution"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-visual">
              <span>
                NO RECORDING LOADED
              </span>

              <small>
                Upload a WAV to render the measured
                time-frequency representation.
              </small>
            </div>
          )}
        </section>

        {/* RESULT */}
        <section className="result-panel">
          <span className="eyebrow">
            03 / DECISION READOUT
          </span>

          {result ? (
            <>
              <div
                className={`decision ${decision}`}
              >
                <span>DECISION</span>

                <strong>
                  {decision.toUpperCase()}
                </strong>
              </div>

              <div className="score-readout">
                <span>
                  ANOMALY SCORE
                </span>

                <strong>
                  {result.anomaly_score.toFixed(
                    6
                  )}
                </strong>

                <div className="score-bar">
                  <i
                    style={{
                      width: `${Math.min(
                        100,
                        (Math.abs(
                          result.anomaly_score
                        ) /
                          Math.max(
                            Math.abs(
                              result.threshold
                            ) * 1.8,
                            0.000001
                          )) *
                          100
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  SCORE / THRESHOLD{" "}
                  <b>
                    {result.anomaly_score.toFixed(
                      4
                    )}{" "}
                    /{" "}
                    {result.threshold.toFixed(
                      4
                    )}
                  </b>
                </small>
              </div>

              {result.agreement && (
                <div className="metric-stack">
                  <Metric
                    label="MODEL AGREEMENT"
                    value={`${result.agreement.anomaly} / ${result.agreement.total} ANOMALY`}
                  />

                  <Metric
                    label="NORMAL MODELS"
                    value={
                      result.agreement
                        .normal
                    }
                  />

                  <Metric
                    label="ANOMALY MODELS"
                    value={
                      result.agreement
                        .anomaly
                    }
                  />

                  <Metric
                    label="DECISION BASIS"
                    value={
                      result.prediction_basis ??
                      "Multi-model comparison"
                    }
                  />
                </div>
              )}

              <div className="metric-stack">
                <Metric
                  label="MODEL"
                  value={result.model}
                />

                <Metric
                  label="MODEL VERSION"
                  value={
                    result.model_version
                  }
                />

                <Metric
                  label="PROCESSING"
                  value={`${result.processing_time_ms.toFixed(
                    1
                  )} ms`}
                />

                <Metric
                  label="DURATION"
                  value={`${result.audio_duration_seconds.toFixed(
                    1
                  )} s`}
                />

                <Metric
                  label="SAMPLE RATE"
                  value={`${result.sample_rate / 1000} kHz`}
                />
              </div>

              {result.model_results &&
                result.model_results
                  .length > 0 && (
                  <div className="table-panel">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            MODEL
                          </th>

                          <th>
                            DECISION
                          </th>

                          <th>
                            SCORE
                          </th>

                          <th>
                            THRESHOLD
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.model_results.map(
                          (item) => (
                            <tr
                              key={
                                item.model
                              }
                            >
                              <td>
                                <b>
                                  {item.display_name ??
                                    item.model}
                                </b>
                              </td>

                              <td>
                                <StatusBadge
                                  value={item.prediction.toLowerCase()}
                                />
                              </td>

                              <td>
                                {Number(
                                  item.anomaly_score
                                ).toFixed(
                                  5
                                )}
                              </td>

                              <td>
                                {Number(
                                  item.threshold
                                ).toFixed(
                                  5
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              {result.explanation_url && (
                <div className="explanation">
                  <span className="eyebrow">
                    EXPLANATION
                  </span>

                  <p>
                    Highlighted regions represent
                    time-frequency areas contributing
                    to the model anomaly score or
                    reconstruction error. They are
                    not proof of a physical fault cause.
                  </p>

                  <img
                    className="analysis-image"
                    src={`${API}${result.explanation_url}`}
                    alt="Model explanation"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-readout">
              AWAITING INPUT
              <br />
              <small>
                Fixed threshold / no calibration at
                inference
              </small>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HISTORY                                                                     */
/* -------------------------------------------------------------------------- */

function History() {
  const [items, setItems] =
    useState<Record<string, unknown>[]>(
      []
    );

  useEffect(() => {
    get<{
      items: Record<string, unknown>[];
    }>("/api/history")
      .then((data) =>
        setItems(data.items)
      )
      .catch(() => setItems([]));
  }, []);

  return (
    <div>
      <SectionHeading
        eyebrow="LOCAL SQLITE / PREDICTION LOG"
        title="History"
        note={`${items.length} RECORDS`}
      />

      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>TIME</th>
              <th>FILE</th>
              <th>MODEL</th>
              <th>DECISION</th>
              <th>SCORE</th>
              <th>THRESHOLD</th>
              <th>PROCESSING</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={String(item.id)}
              >
                <td>
                  {String(
                    item.timestamp
                  )
                    .replace(
                      "T",
                      " "
                    )
                    .replace(
                      "Z",
                      ""
                    )}
                </td>

                <td>
                  {String(
                    item.filename
                  )}
                </td>

                <td>
                  {String(item.model)}
                </td>

                <td>
                  <StatusBadge
                    value={String(
                      item.prediction
                    )}
                  />
                </td>

                <td>
                  {Number(
                    item.anomaly_score
                  ).toFixed(5)}
                </td>

                <td>
                  {Number(
                    item.threshold
                  ).toFixed(5)}
                </td>

                <td>
                  {Number(
                    item.processing_time_ms
                  ).toFixed(1)}{" "}
                  ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!items.length && (
          <div className="empty-table">
            No successful predictions recorded.
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EXPERIMENTS                                                                 */
/* -------------------------------------------------------------------------- */

function Experiments() {
  const [data, setData] =
    useState<
      {
        id: string;
        result: Record<
          string,
          unknown
        >;
      }[]
    >([]);

  useEffect(() => {
    get<{
      experiments: {
        id: string;
        result: Record<
          string,
          unknown
        >;
      }[];
    }>("/api/experiments")
      .then((response) =>
        setData(response.experiments)
      )
      .catch(() => setData([]));
  }, []);

  return (
    <div>
      <SectionHeading
        eyebrow="RESEARCH RECORD / NO RANKING"
        title="Experiments"
        note="STORED METRICS"
      />

      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>
                EXPERIMENT
              </th>
              <th>ROC-AUC</th>
              <th>pAUC</th>
              <th>PRECISION</th>
              <th>RECALL</th>
              <th>F1</th>
              <th>
                PARAMETERS
              </th>
              <th>
                INFERENCE
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map(
              ({
                id,
                result,
              }) => (
                <tr key={id}>
                  <td>
                    <b>
                      {String(
                        result.model ??
                          result.experiment_name ??
                          id
                      )}
                    </b>

                    <small>
                      {id}
                    </small>
                  </td>

                  <td>
                    {Number(
                      result.roc_auc ??
                        0
                    ).toFixed(4)}
                  </td>

                  <td>
                    {Number(
                      result.pauc ??
                        0
                    ).toFixed(4)}
                  </td>

                  <td>
                    {Number(
                      result.precision ??
                        0
                    ).toFixed(4)}
                  </td>

                  <td>
                    {Number(
                      result.recall ??
                        0
                    ).toFixed(4)}
                  </td>

                  <td>
                    {Number(
                      result.f1 ??
                        0
                    ).toFixed(4)}
                  </td>

                  <td>
                    {result.parameter_count
                      ? String(
                          result.parameter_count
                        )
                      : "-"}
                  </td>

                  <td>
                    {result.inference_time_ms
                      ? `${Number(
                          result.inference_time_ms
                        ).toFixed(
                          2
                        )} ms`
                      : "-"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>

      <p className="method-note">
        Values are loaded from the existing experiment
        JSON files. This view is a comparison record,
        not a leaderboard.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ROBUSTNESS                                                                  */
/* -------------------------------------------------------------------------- */

function Robustness() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    get<any>("/api/robustness")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div>
      <SectionHeading
        eyebrow="FIXED CLEAN CALIBRATION / SNR SWEEP"
        title="Noise robustness"
        note="ACTUAL STORED RESULTS"
      />

      {!data && (
        <div className="empty-table">
          Loading robustness results...
        </div>
      )}

      {data?.conditions?.map(
        (condition: any) => (
          <section
            className="condition-section"
            key={
              condition.condition
            }
          >
            <div className="condition-title">
              <b>
                {condition.condition ===
                "clean"
                  ? "CLEAN"
                  : condition.condition}
              </b>

              <span>
                {condition.snr_db ===
                null
                  ? "reference"
                  : `${condition.snr_db} dB SNR`}
              </span>
            </div>

            <div className="robust-grid">
              {condition.models?.map(
                (item: any) => (
                  <div
                    className="robust-row"
                    key={
                      item.model
                    }
                  >
                    <span>
                      {item.model}
                    </span>

                    <i
                      style={{
                        width: `${Math.max(
                          2,
                          Number(
                            item.f1
                          ) * 100
                        )}%`,
                      }}
                    />

                    <b>
                      F1{" "}
                      {Number(
                        item.f1
                      ).toFixed(3)}
                    </b>

                    <small>
                      AUC{" "}
                      {Number(
                        item.roc_auc
                      ).toFixed(3)}{" "}
                      / R{" "}
                      {Number(
                        item.recall
                      ).toFixed(3)}
                    </small>
                  </div>
                )
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ERRORS                                                                      */
/* -------------------------------------------------------------------------- */

function Errors() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    get<any>("/api/errors")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div>
      <SectionHeading
        eyebrow="POST-HOC / FINAL TEST LABELS"
        title="Error analysis"
        note="NO THRESHOLD OPTIMIZATION"
      />

      {!data && (
        <div className="empty-table">
          Loading error analysis...
        </div>
      )}

      {data && (
        <>
          <section className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>CONDITION</th>
                  <th>MODEL</th>
                  <th>TP</th>
                  <th>TN</th>
                  <th>FP</th>
                  <th>FN</th>
                  <th>FPR</th>
                  <th>FNR</th>
                </tr>
              </thead>

              <tbody>
                {data.conditions?.flatMap(
                  (condition: any) =>
                    condition.models?.map(
                      (item: any) => (
                        <tr
                          key={`${condition.condition}-${item.model}`}
                        >
                          <td>
                            {
                              condition.condition
                            }
                          </td>

                          <td>
                            {item.model}
                          </td>

                          <td>
                            {item.TP}
                          </td>

                          <td>
                            {item.TN}
                          </td>

                          <td>
                            {item.FP}
                          </td>

                          <td>
                            {item.FN}
                          </td>

                          <td>
                            {Number(
                              item.false_positive_rate
                            ).toFixed(3)}
                          </td>

                          <td>
                            {Number(
                              item.false_negative_rate
                            ).toFixed(3)}
                          </td>
                        </tr>
                      )
                    ) ?? []
                )}
              </tbody>
            </table>
          </section>

          <div className="figure-grid">
            {[
              ...(data.figure_urls
                ?.errors ?? []),
              ...(data.figure_urls
                ?.explainability ?? []),
            ].map(
              (url: string) => (
                <figure key={url}>
                  <img
                    src={`${API}${url}`}
                    alt="Error analysis"
                  />

                  <figcaption>
                    {url
                      .split("/")
                      .pop()}
                  </figcaption>
                </figure>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RESEARCH                                                                    */
/* -------------------------------------------------------------------------- */

function Research() {
  const [data, setData] =
    useState<any>(null);

  useEffect(() => {
    get<any>("/api/research")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div>
      {data ? (
        <>
          <SectionHeading
            eyebrow="RESEARCH NOTEBOOK / PROTOCOL 42"
            title={data.title}
            note="FAN / ID_00"
          />

          <p className="research-subtitle">
            {data.subtitle}
          </p>

          <div className="research-grid">
            <InfoBlock
              title="Problem statement"
              value={
                data.problem_statement
              }
            />

            <InfoBlock
              title="Dataset"
              value={data.dataset}
            />

            <InfoList
              title="Research questions"
              items={
                data.research_questions
              }
            />

            <InfoList
              title="Hypotheses"
              items={data.hypotheses}
            />

            <InfoList
              title="Methodology"
              items={
                data.methodology
              }
            />

            <InfoBlock
              title="Experimental protocol"
              value={`${data.protocol?.train ?? "-"} train / ${
                data.protocol?.validation ??
                "-"
              } validation / ${
                data.protocol?.final_test ??
                "-"
              } final test / seed ${
                data.protocol?.seed ??
                "-"
              }`}
            />
          </div>
        </>
      ) : (
        <div className="empty-table">
          Loading research information...
        </div>
      )}
    </div>
  );
}

function InfoBlock({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <section className="info-block">
      <span className="eyebrow">
        {title}
      </span>

      <p>{value}</p>
    </section>
  );
}

function InfoList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="info-block">
      <span className="eyebrow">
        {title}
      </span>

      <ul>
        {items?.map((item) => (
          <li key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ABOUT                                                                       */
/* -------------------------------------------------------------------------- */

function About({
  models,
}: {
  models: Model[];
}) {
  return (
    <div>
      <SectionHeading
        eyebrow="SYSTEM MANIFEST / MACHINEGUARD"
        title="About"
        note="RESEARCH PROTOTYPE"
      />

      <div className="about-grid">
        <InfoBlock
          title="Application"
          value="MachineGuard is a research prototype for industrial acoustic anomaly analysis."
        />

        <InfoBlock
          title="Dataset"
          value="MIMII / DCASE 2020 Development Dataset - fan / id_00"
        />

        <InfoBlock
          title="Preprocessing"
          value="16 kHz, mono, deterministic 10-second window, 64-bin normalized Log-Mel, n_fft 1024, hop 512."
        />

        <InfoBlock
          title="Execution"
          value="CPU-first inference using trained MachineGuard artifacts and fixed evaluation thresholds."
        />

        <InfoBlock
          title="Project structure"
          value="backend/ FastAPI services and routes; frontend/ React and Vite workstation; src/ reusable ML pipeline; models/ trained artifacts; results/ research evidence and runtime outputs."
        />
      </div>

      <section className="table-panel">
        <table>
          <thead>
            <tr>
              <th>MODEL</th>
              <th>STATUS</th>
              <th>VERSION</th>
              <th>REASON</th>
            </tr>
          </thead>

          <tbody>
            {models.map((model) => (
              <tr key={model.id}>
                <td>{model.name}</td>

                <td>
                  <StatusBadge
                    value={model.status}
                  />
                </td>

                <td>
                  <code>
                    {model.model_version ??
                      "-"}
                  </code>
                </td>

                <td>{model.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* APP                                                                         */
/* -------------------------------------------------------------------------- */

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;