import numpy as np

def fit_normalizer(scores):
    s=np.asarray(scores,float)
    return float(s.mean()), float(s.std()+1e-8)

def normalize(scores, mean, std):
    return (np.asarray(scores,float)-mean)/std

def fuse(score_sets, weights):
    w=np.asarray(weights,float)
    w=w/w.sum()
    return sum(wi*np.asarray(si) for wi,si in zip(w,score_sets))
