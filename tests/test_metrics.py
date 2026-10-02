from src.evaluation.metrics import evaluate,validation_threshold
def test_metrics():
    m=evaluate([0,0,1,1],[0.1,0.2,0.8,0.9],0.5)
    assert m["roc_auc"]==1.0
    assert "pauc" in m
def test_threshold():
    assert validation_threshold([1,2,3],95)>2
