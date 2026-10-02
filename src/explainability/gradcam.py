class GradCAM:
    # Lightweight hook-based scaffold. Activate only for a trained CNN model.
    def __init__(self, model, target_layer):
        self.model=model
        self.target_layer=target_layer
        self.activations=None
        self.gradients=None
        target_layer.register_forward_hook(self._forward_hook)
        target_layer.register_full_backward_hook(self._backward_hook)

    def _forward_hook(self,module,inputs,output):
        self.activations=output.detach()

    def _backward_hook(self,module,grad_input,grad_output):
        self.gradients=grad_output[0].detach()

    def generate(self):
        if self.activations is None or self.gradients is None:
            raise RuntimeError("Run a forward/backward pass before Grad-CAM.")
        weights=self.gradients.mean(dim=(2,3),keepdim=True)
        cam=(weights*self.activations).sum(1,keepdim=True).clamp(min=0)
        cam=cam/(cam.amax(dim=(2,3),keepdim=True)+1e-8)
        return cam
