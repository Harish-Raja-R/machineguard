import numpy as np
from sklearn.metrics import roc_auc_score, roc_curve, precision_score, recall_score, f1_score, confusion_matrix

def partial_auc(y_true, scores, max_fpr=0.1):
    fpr,tpr,_=roc_curve(y_true,scores)
    keep=fpr<=max_fpr
    if keep.sum()<2: return 0.0
    return float(np.trapezoid(tpr[keep],fpr[keep])/max_fpr)

def evaluate(y_true,scores,threshold):
    pred=(np.asarray(scores)>=threshold).astype(int)
    return {
      "roc_auc":float(roc_auc_score(y_true,scores)),
      "pauc":partial_auc(y_true,scores),
      "precision":float(precision_score(y_true,pred,zero_division=0)),
      "recall":float(recall_score(y_true,pred,zero_division=0)),
      "f1":float(f1_score(y_true,pred,zero_division=0)),
      "confusion_matrix":confusion_matrix(y_true,pred).tolist()
    }

def validation_threshold(normal_scores, percentile=95):
    return float(np.percentile(normal_scores, percentile))
