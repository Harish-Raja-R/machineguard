import torch
from src.models.cnn_autoencoder import CNNAutoencoder
from src.models.cnn_attention import CNNAttentionAutoencoder

def test_autoencoder_shape():
    x=torch.randn(2,1,64,313)
    y=CNNAutoencoder()(x)
    assert y.shape==x.shape

def test_attention_shape():
    x=torch.randn(2,1,64,313)
    model = CNNAttentionAutoencoder()
    rec, attn = model(x, return_attention=True)
    assert rec.shape == x.shape
    assert attn.shape[1] == 1
