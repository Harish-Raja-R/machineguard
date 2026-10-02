from sklearn.svm import OneClassSVM
from sklearn.ensemble import IsolationForest

def make_ocsvm(kernel="rbf", nu=0.05, gamma="scale"):
    return OneClassSVM(kernel=kernel, nu=nu, gamma=gamma)

def make_isolation_forest(n_estimators=200, max_samples="auto", random_state=42):
    return IsolationForest(
        n_estimators=n_estimators,
        max_samples=max_samples,
        contamination="auto",
        random_state=random_state,
        n_jobs=-1
    )
