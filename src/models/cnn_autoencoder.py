import torch
from torch import nn
import torch.nn.functional as F

class CNNAutoencoder(nn.Module):
    def __init__(self, latent_channels=32, dropout=0.0):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 8, 3, padding=1), nn.BatchNorm2d(8), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(8, 16, 3, padding=1), nn.BatchNorm2d(16), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, latent_channels, 3, padding=1), nn.BatchNorm2d(latent_channels), nn.ReLU(),
            nn.Dropout2d(dropout)
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(latent_channels, 16, 2, stride=2), nn.ReLU(),
            nn.ConvTranspose2d(16, 8, 2, stride=2), nn.ReLU(),
            nn.Conv2d(8, 1, 3, padding=1)
        )

    def forward(self, x):
        y = self.decoder(self.encoder(x))
        if y.shape[-2:] != x.shape[-2:]:
            y = F.interpolate(y, size=x.shape[-2:], mode="bilinear", align_corners=False)
        return y

def reconstruction_scores(model, x):
    with torch.no_grad():
        y = model(x)
        return ((y-x)**2).flatten(1).mean(1)
