package it.unisa.c16.raduna;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PipelineSmokeController.class)
@AutoConfigureMockMvc(addFilters = false)
class PipelineSmokeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void TF_SMOKE_01_getPipelineSmokeReturnsOk() throws Exception {
        mockMvc.perform(get("/pipeline-smoke"))
                .andExpect(status().isOk());
    }

    @Test
    void TF_SMOKE_02_getPipelineSmokeReturnsExactBody() throws Exception {
        mockMvc.perform(get("/pipeline-smoke"))
                .andExpect(content().string("Pipeline agentica OK"));
    }

    @Test
    void TF_SMOKE_03_getPipelineSmokeAllowsUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/pipeline-smoke"))
                .andExpect(status().isOk());
    }
}
